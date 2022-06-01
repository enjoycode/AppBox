namespace AppBoxDesign;

internal sealed class SignatureItem
{
    public string Name { get; set; }

    public string Label { get; set; }

    public string? Documentation { get; set; }

    public IEnumerable<SignatureParameter> Parameters { get; set; }

    // public DocumentationComment StructuredDocumentation { get; set; }
}