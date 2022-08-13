using System;
using System.Collections.Generic;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class PublishDialog : Dialog
    {
        public PublishDialog()
        {
            Width = 400;
            Height = 300;
            Title.Value = "Publish";
        }

        private readonly DataGridController<ChangedModel> _dataGridController =
            new DataGridController<ChangedModel>();

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new DataGrid<ChangedModel>(_dataGridController)
                {
                    Columns = new DataGridColumn<ChangedModel>[]
                    {
                        new DataGridTextColumn<ChangedModel>("ModelType",
                            v => v.ModelType),
                        new DataGridTextColumn<ChangedModel>("ModelId", v => v.ModelId),
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
                var res = await Channel.Invoke<ChangedModel[]?>(
                    "sys.DesignService.GetPendingChanges");
                if (res != null)
                    _dataGridController.DataSource = new List<ChangedModel>(res);
            }
            catch (Exception e)
            {
                Notification.Error("加载模型变更失败");
            }
        }

        protected override bool OnClosing(bool canceled)
        {
            if (!canceled) //TODO: check no items to publish
                PublishAsync();
            return base.OnClosing(canceled);
        }

        private static async void PublishAsync()
        {
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