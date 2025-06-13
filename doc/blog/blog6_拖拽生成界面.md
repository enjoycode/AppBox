&emsp;&emsp;之前为了应对客制化大屏设计的需求，在框架内实现了拖拽方式（动态化）生成用户界面的功能，跟大部分实现方式差不多，设计时生成配置json，然后在运行时解析json生成用户界面。这次完善了一下该功能，支持类似于零代码平台生成增删改查界面，下面简单介绍一下操作步骤。

## 一、准备数据结构
&emsp;&emsp;参考[之前的文章](https://www.cnblogs.com/BaiCai/p/18026244)准备好所需的实体模型。

## 二、详情视图
&emsp;&emsp;进入开发后台后，主菜单`New->View`，参考下图选择`Dynamic`类型的视图。
可以参考之前的[可视化大屏设计视频](https://www.toutiao.com/i7293883261099606563)了解一下如何布局组件。
![](imgs/6_NewView.png)

### 1. 创建数据状态
&emsp;&emsp;点击右上部`State`旁的添加按钮，添加类型为`DataRow`，名称为`customer`的状态，点击右侧修改按纽参考下图选择对应的`Customer`实体，并选择相应的列。
![](imgs/6_DataRow.png)

### 2. 详情表单布局
&emsp;&emsp;参考下图大纲结构设计表单。
![](imgs/6_EditView.png)

### 3. 绑定表单至状态
&emsp;&emsp;在设计界面依次选择表单输入项，然后点击右侧属性面板内`Text`属性面侧的绑定按钮，在弹出的对话框内选择绑定的数据状态对应的列（绑定成功后绑定按纽为变为绿色）。
![](imgs/6_BindToState.png)

### 4. 绑定保存按纽事件
&emsp;&emsp;在设计界面选择`保存`按纽，然后点击右侧属性面板内的`OnTap`事件，在弹出对话框内选择`SaveData`事件操作，并勾选`customer`数据状态。

## 三、列表视图

### 1. 创建数据状态
&emsp;&emsp;先添加类型为`String`，名称为`qName`的状态，用于绑定查询过滤条件，然后再添加`DataTable`类型名为`customers`的状态，参考下图分别设置查询返回的列及过滤条件。
![](imgs/6_QuerySelects.png)

![](imgs/6_QueryFilter.png)

### 2. 列表视图布局
&emsp;&emsp;参考下图大纲结构设计列表视图。
![](imgs/6_ListView.png)

### 3. 绑定按钮事件
&emsp;&emsp;分别绑定`新建`、`编辑`、`删除`、`搜索`按纽的事件操作，其中`新建`与`删除`按钮都是绑定至`ShowDialog`操作，不同的是向目标视图`CustomerEdit`传入的视图参数分别是`CreateRow`及`FetchRow`类型，`FetchRow`视图参数请参考下图设置主键字段来源于当前视图的哪个状态。
![](imgs/6_BindEvent.png)
![](imgs/6_FetchRow.png)


## 四、测试运行
&emsp;&emsp;保存并发布上述模型后，就可以在应用端测试运行了（如下图所示）。
![](imgs/6_RunDemo.png)

## 五、待实现功能
* 目前查询与保存暂未做权限验证，后续将在实体模型设计时提供是否允许动态化查询与保存的相关权限设计；
* 需要完善如实体关联选择等动态化组件；
* 事件支持脚本或图形化脚本；

## 六、本篇小结
&emsp;&emsp;作者个人能力实在有限Bug在所难免，如有问题请邮件联系或[Github Issue](https://github.com/enjoycode/AppBox.git)，欢迎感兴趣的小伙伴们加入共同完善，当然更欢迎赞助项目或给作者介绍工作（目前找工作中）。