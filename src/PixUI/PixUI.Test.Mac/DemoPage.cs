﻿using System;
using PixUI.Test.Mac;

namespace PixUI.Test
{
    public sealed class DemoPage : View
    {
        private readonly Rx<string> _firstName = "Rick";
        private readonly Rx<string> _lastName = "Lg";
        private readonly RxComputed<string> _fullName;
        private readonly Rx<ImageSource> _imgSrc;

        private readonly WidgetRef<Button> _buttonRef = new();
        private ListPopup<Person>? _listPopup;

        public DemoPage()
        {
            _fullName = Compute(_firstName, _lastName,
                (first, last) => "Full:" + first + "-" + last);

            var imgData = Resources.LoadBytes("Resources.Cat.webp");
            Rx<ImageSource> defaultImgSrc = ImageSource.FromEncodedData(imgData);
            _imgSrc = Bind(defaultImgSrc, BindingOptions.AffectsVisual);

            Child = BuildChild();
        }

        private Widget BuildChild()
        {
            return new Column(debugLabel: "Main")
            {
                Children = new Widget[]
                {
                    //Body
                    new Expanded
                    {
                        Child = new Column(spacing: 8, debugLabel: "Body")
                        {
                            Children = new Widget[]
                            {
                                new Text(_firstName) { FontSize = 20, TextColor = Colors.Red },
                                new Text(_lastName) { FontSize = 20, TextColor = Colors.Red },
                                new Text(_fullName) { FontSize = 50, TextColor = Colors.Red },
                                new Button("Click Me", Icons.Filled.Search) { OnTap = OnButtonTap },
                                new ButtonGroup()
                                {
                                    Children = new[]
                                    {
                                        new Button("Button1")
                                            { OnTap = OnButton1Tap, Ref = _buttonRef },
                                        new Button("Button2"),
                                        new Button("Button3")
                                    },
                                },
                                new Input("Hello World!")
                                {
                                    Width = 200, FontSize = 20,
                                    Prefix = new Icon(Icons.Filled.Person) { Size = 20 },
                                    Suffix = new Icon(Icons.Filled.Search) { Size = 20 }
                                },
                                new Input("")
                                {
                                    Width = 200, FontSize = 20, IsObscure = true,
                                    Prefix = new Icon(Icons.Filled.Lock) { Size = 20 },
                                    HintText = "Password",
                                },
                                new Card
                                {
                                    Elevation = 2, Width = 200, Height = 266,
                                    Child = new ImageBox(_imgSrc)
                                    {
                                        Width = 200,
                                        Height = 266
                                    }
                                }
                            }
                        }
                    },
                    //Footer
                    new Container
                        { Height = 20, BgColor = new Color(0xFFCA673B), DebugLabel = "Footer" }
                }
            };
        }

        private void OnButtonTap(PointerEvent e)
        {
            _firstName.Value = "Eric " + DateTime.Now.Second;

            Notification.Error("Click Done!");

            // var dlg = new DemoDialog(Overlay!,
            //     (canceled, res) =>
            //     {
            //         Console.WriteLine(canceled ? "Dialog closed" : $"Dialog closed: {res}");
            //     });
            // dlg.Show();
        }

        private void OnButton1Tap(PointerEvent e)
        {
            _listPopup ??= new ListPopup<Person>(Overlay!, BuidPopupItem, 200, 25)
                { OnSelectionChanged = OnListPopupSelectionChanged };
            _listPopup.DataSource ??= Person.GeneratePersons(10);
            if (!_listPopup.IsMounted)
                _listPopup.Show(_buttonRef.Widget, new Offset(-4, -2), Popup.DefaultTransitionBuilder);
            else
                _listPopup?.Hide();
        }

        private void OnListPopupSelectionChanged(Person? person)
        {
            _lastName.Value = person == null ? "" : person.Name;
        }

        private Widget BuidPopupItem(Person person, int index, State<bool> isHover,
            State<bool> isSelected)
        {
            var color = RxComputed<Color>.Make(isSelected,
                v => v ? Colors.White : Colors.Black);
            return new Text(person.Name) { TextColor = color };
        }

        protected override void OnMounted()
        {
            Console.WriteLine("DemoPage Mounted +++");
            base.OnMounted();
        }

        protected override void OnUnmounted()
        {
            Console.WriteLine("DemoPage Unmounted ---");
            base.OnUnmounted();
        }
    }

    // class DemoShadow : Widget
    // {
    //     protected override void Layout(float availableWidth, float availableHeight)
    //     {
    //         W = 192;
    //         H = 92;
    //     }
    //
    //     protected override void Paint(Canvas canvas, IDirtyArea? area = null)
    //     {
    //         var rect = Rect.FromLTWH(0, 0, W, H);
    //         using var path = new Path();
    //         path.AddRect(rect);
    //         // Console.WriteLine($"Path Bounds = {path.Bounds}");
    //         canvas.DrawShadow(path, Colors.Green, 5, false, Root!.Window.ScaleFactor);
    //
    //         canvas.DrawRect(rect, PixUI.Paint.Default(color: Colors.White));
    //     }
    // }
}