# AVAILABLE WIDGETS

* Text

```json
{
  "Summary": "显示文本",
  "Properties": [
    { "Name": "Text", "Type": "State<string>" },
    { "Name": "TextColor", "Type": "State<Color>?", "Summary": "可选文本颜色" },
    { "Name": "FontSize", "Type": "State<float>?", "Summary": "可选字体大小" },
    { "Name": "Width", "Type": "State<float>?", "Summary": "指定的宽度" },
    { "Name": "Height", "Type": "State<float>?", "Summary": "指定的高度" }
  ]
}
```

* Center

```json
{
  "Summary": "布局时将子组件居中",
  "Properties": [
    { "Name": "Child", "Type": "Widget?>" }
  ]
}
```

* Row

```json
{
  "Summary": "按行排列各个子组件",
  "Properties": [
    { "Name": "Spacing", "Type": "float", "Summary": "每个子组件的间隙" },
    { "Name": "Children", "Type": "IList<Widget>" }
  ]
}
```

* Column

```json
{
  "Summary": "按列排列各个子组件",
  "Properties": [
    { "Name": "Spacing", "Type": "float", "Summary": "每个子组件的间隙" },
    { "Name": "Children", "Type": "IList<Widget>" }
  ]
}
```

* Button

```json
{
  "Summary": "按钮，通过设置OnTap属性绑定事件处理",
  "Properties": [
    { "Name": "Text", "Type": "State<string>?", "Summary": "按钮的文本" },
    { "Name": "OnTap", "Type": "Action<PointerEvent>" }
  ]
}
```

* Card
```json
{
  "Summary": "Elevated card container",
  "Properties": [
    { "Name": "Color", "Type": "State<Color>?" },
    { "Name": "ShadowColor", "Type": "State<Color>?" },
    { "Name": "Elevation", "Type": "State<float>?" },
    { "Name": "Width", "Type": "State<float>?", "Summary": "指定的宽度"},
    { "Name": "Height", "Type": "State<float>?", "Summary": "指定的高度"}
  ]
}
```

* TextInput

```json
{
  "Summary": "文本输入框",
  "Properties": [
    { "Name": "Text", "Type": "State<string>" },
    { "Name": "TextColor", "Type": "State<Color>?", "Summary": "文本的颜色"},
    { "Name": "IsObscure", "Type": "bool", "Summary": "是否隐藏文本，用于密码输入" }
  ]
}
```
