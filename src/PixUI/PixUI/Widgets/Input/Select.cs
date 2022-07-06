namespace PixUI
{
    public sealed class Select
    {
        public Select(bool filterable)
        {
            _filterable = filterable;
        }

        private readonly bool _filterable;
    }
}