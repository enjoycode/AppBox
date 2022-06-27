using System;
using System.Collections.Generic;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class PublishDialog : Dialog<bool>
    {
        public PublishDialog(Overlay overlay) : base(overlay)
        {
            Width = 400;
            Height = 300;
            Title.Value = "Publish";
            OnClose = _OnClose;
        }

        private readonly DataGridController<ChangedModel> _dataGridController =
            new DataGridController<ChangedModel>();

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new Column(HorizontalAlignment.Right, 20)
                {
                    Children = new Widget[]
                    {
                        new Expanded()
                        {
                            Child = new DataGrid<ChangedModel>(_dataGridController)
                            {
                                Columns = new List<DataGridColumn<ChangedModel>>()
                                {
                                    new DataGridTextColumn<ChangedModel>("ModelType",
                                        v => v.ModelType),
                                    new DataGridTextColumn<ChangedModel>("ModelId", v => v.ModelId),
                                }
                            }
                        },
                        new Row(VerticalAlignment.Middle, 20)
                        {
                            Children = new Widget[]
                            {
                                new Button("Cancel") { OnTap = _ => Close(true) },
                                new Button("OK") { OnTap = _ => Close(false) },
                            }
                        }
                    }
                }
            };
        }

        protected override void OnMounted()
        {
            base.OnMounted();
            //开始加载变更项
            LoadChanges();
        }

        private async void LoadChanges()
        {
            try
            {
                var res = await Channel.Invoke("sys.DesignService.GetPendingChanges");
                _dataGridController.DataSource = new List<ChangedModel>((ChangedModel[])res);
            }
            catch (Exception e)
            {
                Notification.Error("加载模型变更失败");
            }
        }

        protected override bool GetResult(bool canceled) => canceled;

        private static async void _OnClose(bool canceled, bool result)
        {
            if (canceled) return;

            try
            {
                await Channel.Invoke("sys.DesignService.Publish",
                    new object?[] { "commit message" });
                Notification.Success("发布成功");
            }
            catch (Exception e)
            {
                Notification.Error("发布失败");
            }
        }
    }
}