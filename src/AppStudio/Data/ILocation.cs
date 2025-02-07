namespace AppBoxDesign;

internal interface ILocation
{
    string? Location { get; }

    int Offset { get; }

    int Length { get; }
}