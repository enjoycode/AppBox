using System;

namespace PixUI
{
    public sealed class IfConditional : Conditional<bool>
    {
        public IfConditional(State<bool> state, Func<Widget> trueBuilder,
            Func<Widget>? falseBuilder = null) : base(state,
            falseBuilder == null
                ? new[]
                {
                    new WhenBuilder<bool>(v => v, trueBuilder),
                }
                : new[]
                {
                    new WhenBuilder<bool>(v => v, trueBuilder),
                    new WhenBuilder<bool>(v => !v, falseBuilder)
                }
        ) { }
    }
}