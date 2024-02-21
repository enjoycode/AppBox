using sys.Entities;

namespace sys.Views;

public sealed class EmployeeView : View
{
    public static EmployeeView Preview() => new(new());

    public EmployeeView(RxEmployee state)
    {
        Child = new Form
        {
            Padding = EdgeInsets.All(10),
            LabelWidth = 50,
            Children =
            {
                new ("姓名:", new TextInput(state.Name)),
                new ("生日:", new DatePicker(state.Birthday)),
                new ("性别:", new Row { Children =
                {
                    new Radio(state.Male),
                    new Text("男"),
                    new Radio(state.Male.ToReversed()),
                    new Text("女"),
                }}),
                new ("用户:", new Row
                {
                    Spacing = 5,
                    Children =
                    {
                        new Expanded( new TextInput(state.Account.ToNoneNullable()) { Readonly = true }),
                        new Button(state.Account.ToComputed(v=> string.IsNullOrEmpty(v) ? "新建用户" : "删除用户"))
                        { OnTap = _ => OnChangeAccount(state) },
                        new Button("重置密码") { OnTap = _ => OnResetPassword(state) }
                    }
                }),
            }
        };
    }

    private async void OnChangeAccount(RxEmployee emp)
    {
        var forCreate = string.IsNullOrEmpty(emp.Account.Value);
        if (forCreate)
        {
            //新建用户
            var userInfo = new UserInfo(forCreate);
            var res = await Dialog.ShowAsync("新建用户", d => userInfo, BuildDialogFooter,  new(250, 170));
            if (res != DialogResult.OK) return;
            try
            {
                await sys.Services.OrgUnitService.NewEmployeeUser(emp.Target, userInfo.Account, userInfo.Password);
                emp.Account.Value = userInfo.Account;
            }
            catch(Exception ex)
            {
                Notification.Error($"新建用户失败: {ex.Message}");
            }
        }
        else
        {
            //删除用户
            try
            {
                await sys.Services.OrgUnitService.DeleteEmployeeUser(emp.Target);
                emp.Account.Value = null;
            }
            catch(Exception ex)
            {
                Notification.Error($"删除用户失败: {ex.Message}");
            }
        }
    }
    
    private async void OnResetPassword(RxEmployee emp)
    {
        if (string.IsNullOrEmpty(emp.Account.Value)) return;
        
        var userInfo = new UserInfo(false, emp.Account.Value);
        var res = await Dialog.ShowAsync("重置密码", d => userInfo, BuildDialogFooter, new(250, 170));
        if (res != DialogResult.OK) return;
        
        try
        {
            await sys.Services.OrgUnitService.ResetPassword(emp.Target, userInfo.Password);
        }
        catch(Exception ex)
        {
            Notification.Error($"重置密码失败: {ex.Message}");
        }
    }
    
    private static Widget BuildDialogFooter(Dialog dialog) => new Container
    {
        Height = 70,
        Padding = EdgeInsets.All(20),
        Child = new Row
        {
            Alignment = VerticalAlignment.Middle,
            Spacing = 20,
            Children =
            {
                new Expanded(),
                new Button("取消") { Width = 80, OnTap = _ => dialog.Close(DialogResult.Cancel) },
                new Button("确认") { Width  =80, OnTap = _ => dialog.Close(DialogResult.OK)}
            }
        }
    };

    private sealed class UserInfo : View
    {
        public UserInfo(bool forCreate, string? account = null)
        {
            if (!forCreate && !string.IsNullOrEmpty(account))
                _account.Value = account;

            Child = new Form
            {
                LabelWidth = 50,
                Children =
                {
                    new ("用户:", new TextInput(_account) { Readonly = !forCreate }),
                    new ("密码:", new TextInput(_password) { IsObscure = true })
                }  
            };
        }
        
        private readonly State<string> _account = "";
        private readonly State<string> _password = "";
        
        public string Account => _account.Value;
        public string Password => _password.Value;
    }

}