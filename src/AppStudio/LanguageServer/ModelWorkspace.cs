using System.Collections.Immutable;
using System.Reflection;
using System.Threading;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Completion;
using Microsoft.CodeAnalysis.CSharp.Completion;
using Microsoft.CodeAnalysis.CSharp.Formatting;
using Microsoft.CodeAnalysis.Host;
using Microsoft.CodeAnalysis.Host.Mef;
using Microsoft.CodeAnalysis.Text;

namespace AppBoxDesign;

internal sealed class ModelWorkspace : Workspace
{
    public bool Initialized { get; set; }
    // public BufferManager BufferManager { get; private set; }

    public ModelWorkspace(HostServicesAggregator aggregator)
        : base(aggregator.CreateHostServices(), "Custom")
    {
        // BufferManager = new BufferManager(this);
    }

    public override bool CanOpenDocuments => true;

    public override bool CanApplyChange(ApplyChangesKind feature) => true;

    public override void OpenDocument(DocumentId documentId, bool activate = true)
    {
        var doc = CurrentSolution.GetDocument(documentId);
        if (doc != null)
        {
            var text = doc.GetTextAsync(CancellationToken.None)
                .WaitAndGetResult(CancellationToken.None);
            OnDocumentOpened(documentId, text.Container, activate);
        }
        else
        {
            Log.Warn($"Can't open document: {documentId}");
        }
    }

    public async Task OpenDocumentAsync(DocumentId documentId, bool activate = true)
    {
        var doc = CurrentSolution.GetDocument(documentId);
        if (doc != null)
        {
            var text = await doc.GetTextAsync(CancellationToken.None);
            OnDocumentOpened(documentId, text.Container, activate);
        }
        else
        {
            Log.Warn($"Can't open document: {documentId}");
        }
    }

    public override void CloseDocument(DocumentId documentId)
    {
        var doc = CurrentSolution.GetDocument(documentId);
        if (doc != null)
        {
            var text = doc.GetTextAsync(CancellationToken.None)
                .WaitAndGetResult(CancellationToken.None);
            var version = doc.GetTextVersionAsync(CancellationToken.None)
                .WaitAndGetResult(CancellationToken.None);
            var loader = TextLoader.From(TextAndVersion.Create(text, version, doc.FilePath));
            OnDocumentClosed(documentId, loader);
        }
        else
        {
            Log.Warn($"Can't close document: {documentId}");
        }
    }

    internal void OnDocumentChanged(DocumentId documentId, SourceText text)
    {
        OnDocumentTextChanged(documentId, text, PreservationMode.PreserveIdentity);
    }

    public Document? GetOpenedDocumentByName(string fileName)
    {
        return GetOpenDocumentIds()
            .Select(id => CurrentSolution.GetDocument(id))
            .FirstOrDefault(doc => doc != null && doc.Name == fileName);
    }
}

internal sealed class HostServicesAggregator
{
    private readonly ImmutableArray<Assembly> _assemblies;

    public HostServicesAggregator( /*IEnumerable<IHostServicesProvider> hostServicesProviders*/)
    {
        var builder = ImmutableHashSet.CreateBuilder<Assembly>();

        // We always include the default Roslyn assemblies:
        // foreach (var assembly in MefHostServices.DefaultAssemblies)
        // {
        //     builder.Add(assembly);
        // }
        builder.Add(typeof(Workspace).Assembly); //Microsoft.CodeAnalysis.Workspaces
        builder.Add(typeof(CompletionItem).Assembly); //Microsoft.CodeAnalysis.Features
        builder.Add(typeof(CSharpFormattingOptions).Assembly); //Microsoft.CodeAnalysis.CSharp.Workspaces
        builder.Add(typeof(CSharpCompletionService).Assembly); //Microsoft.CodeAnalysis.CSharp.Features

        // foreach (var provider in hostServicesProviders)
        // {
        //     foreach (var assembly in provider.Assemblies)
        //     {
        //         builder.Add(assembly);
        //     }
        // }

        _assemblies = builder.ToImmutableArray();
    }

    public HostServices CreateHostServices()
    {
        return MefHostServices.Create(_assemblies);
    }
}