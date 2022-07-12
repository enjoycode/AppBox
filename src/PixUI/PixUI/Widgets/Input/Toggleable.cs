namespace PixUI
{
    public abstract class Toggleable : Widget, IMouseRegion
    {
        protected Toggleable(State<bool?> value, bool triState = false)
        {
            _triState = triState;
            _value = Bind(value, BindingOptions.AffectsVisual);
            _positionController =
                new AnimationController(100, value.Value != null && value.Value.Value ? 1 : 0);
            _positionController.ValueChanged += OnPositionValueChanged;

            MouseRegion = new MouseRegion(() => Cursors.Hand);
            MouseRegion.PointerTap += OnTap;
        }

        private readonly State<bool?> _value;
        private readonly bool _triState;
        protected readonly AnimationController _positionController;
        public MouseRegion MouseRegion { get; }

        private void OnTap(PointerEvent e)
        {
            //TODO: skip on readonly

            if (_value.Value == null)
                _value.Value = false;
            else if (_value.Value == true)
                _value.Value = _triState ? null : false;
            else
                _value.Value = true;
        }

        private void AnimateToValue()
        {
            if (_triState)
            {
                if (_value.Value == null)
                    _positionController.SetValue(0);
                else if (_value.Value == true)
                    _positionController.Forward();
                else
                    _positionController.Reverse();
            }
            else
            {
                if (_value.Value != null && _value.Value == true)
                    _positionController.Forward();
                else
                    _positionController.Reverse();
            }
        }

        private void OnPositionValueChanged()
        {
            Invalidate(InvalidAction.Repaint);
        }

        public override void OnStateChanged(StateBase state, BindingOptions options)
        {
            if (ReferenceEquals(state, _value))
            {
                AnimateToValue();
                return;    
            }
            
            base.OnStateChanged(state, options);
        }
    }
}