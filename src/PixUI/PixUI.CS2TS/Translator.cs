using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    /// <summary>
    /// 管理待翻译的工程
    /// </summary>
    public sealed class Translator
    {
        private readonly Workspace _workspace;
        private readonly ProjectId _projectId;
        private readonly List<GenericTypeOverloads> _genericOverloads = new();

        internal readonly bool IsPixUIProject;

        private static readonly MetadataReference[] Refs;

        static Translator()
        {
            var path = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
            Refs = new MetadataReference[]
            {
                MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
                MetadataReference.CreateFromFile(Path.Combine(path, "netstandard.dll")),
                MetadataReference.CreateFromFile(Path.Combine(path, "System.Collections.dll")),
                MetadataReference.CreateFromFile(Path.Combine(path, "System.Runtime.dll")),
                MetadataReference.CreateFromFile(Path.Combine(path, "System.Linq.dll")),
                MetadataReference.CreateFromFile(Path.Combine(path, "System.Console.dll")),
                // MetadataReference.CreateFromFile(Path.Combine(path, "System.Private.CoreLib.dll")),
            };

            //注册自定义拦截器
            TSInterceptorFactory.RegisterCustomInterceptor("CanvasKitCtor",
                new CanvasKitCtorInterceptor());
        }

        public Translator(string projectName, string[]? refDllPaths = null)
        {
            _workspace = new AdhocWorkspace();
            IsPixUIProject = projectName == "PixUI";
            _projectId = ProjectId.CreateNewId();
            CreateProject(_projectId, projectName, refDllPaths);
        }

        /// <summary>
        /// 专用于设计时转换单个视图模型
        /// </summary>
        public Translator(Workspace workspace, ProjectId projectId)
        {
            _workspace = workspace;
            _projectId = projectId;
        }

        private void CreateProject(ProjectId id, string name, string[]? refDllPaths = null)
        {
            var complieOpts = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
                .WithNullableContextOptions(NullableContextOptions.Enable);
            var parseOpts = new CSharpParseOptions()
                .WithLanguageVersion(LanguageVersion.CSharp10)
                .WithPreprocessorSymbols("__WEB__");

            var metaRefs = Refs;
            if (refDllPaths != null)
            {
                foreach (var dllPath in refDllPaths)
                {
                    var metaRef = MetadataReference.CreateFromFile(dllPath);
                    metaRefs = metaRefs.Concat(new[] { metaRef }).ToArray();
                }
            }

            var projectInfo = ProjectInfo.Create(id, VersionStamp.Default,
                    name, name, LanguageNames.CSharp)
                .WithCompilationOptions(complieOpts)
                .WithParseOptions(parseOpts)
                .WithMetadataReferences(metaRefs);
            ((AdhocWorkspace)_workspace).AddProject(projectInfo);
        }

        /// <summary>
        /// 添加需要转换的工程的所有源文件
        /// </summary>
        internal Workspace AddSourceFiles(string prjPath)
        {
            foreach (var fullPath in Directory.EnumerateFiles(prjPath, "*.cs",
                         SearchOption.AllDirectories))
            {
                var filePath = Path.GetRelativePath(prjPath, fullPath);
                if (filePath.StartsWith("obj/")) continue;

                var fileName = Path.GetFileName(filePath);
                var folders = Path.GetDirectoryName(filePath)?.Split(Path.PathSeparator);

                var docInfo = DocumentInfo.Create(DocumentId.CreateNewId(_projectId), fileName,
                    folders, SourceCodeKind.Regular,
                    new FileTextLoader(Path.GetFullPath(fullPath), Encoding.Default));
                ((AdhocWorkspace)_workspace).AddDocument(docInfo);
            }

            return _workspace;
        }

        /// <summary>
        /// Only for test
        /// </summary>
        internal Document AddTestFile(string filePath)
        {
            var fileName = Path.GetFileName(filePath);
            var fullPath = Path.GetFullPath(filePath);
            var docInfo = DocumentInfo.Create(DocumentId.CreateNewId(_projectId), fileName,
                new[] { "Src" }, SourceCodeKind.Regular,
                new FileTextLoader(fullPath, Encoding.Default));
            return ((AdhocWorkspace)_workspace).AddDocument(docInfo);
        }

        internal void AddGenericTypeOverloads(TypeDeclarationSyntax node)
        {
            var typeName = node.Identifier.Text;
            var exists = _genericOverloads
                .SingleOrDefault(t => t.TypeName == typeName);
            if (exists == null)
            {
                exists = new GenericTypeOverloads(typeName);
                _genericOverloads.Add(exists);
            }

            exists.Declarations.Add(node);
        }

        internal void ExportGenericTypeOverloads(StringBuilder output) //TODO: remove, not supported
        {
            foreach (var item in _genericOverloads)
            {
                //先按类型参数个数排序
                var nodes = item.Declarations
                    .OrderBy(t =>
                        t.TypeParameterList == null ? 0 : t.TypeParameterList.Parameters.Count)
                    .ToArray();

                var typesMin = nodes.First().TypeParameterList == null
                    ? 0
                    : nodes.First().TypeParameterList!.Parameters.Count;
                var typesMax = nodes.Last().TypeParameterList!.Parameters.Count;

                output.Append("export type ");
                output.Append(item.TypeName);
                output.Append('<');

                for (var i = 0; i < typesMax; i++)
                {
                    if (i != 0) output.Append(", ");

                    output.Append('T');
                    output.Append(i + 1);

                    if (i >= typesMin)
                        output.Append(" = void");
                }

                output.Append("> = \n");

                for (var i = typesMin; i < typesMax; i++)
                {
                    output.Append('\t', i - typesMin + 1);
                    output.Append('T');
                    output.Append(i + 1);
                    output.Append(" extends void ? ");

                    WriteGenericType(output, item.TypeName, i);

                    output.Append(" :\n");
                    if (i == typesMax - 1) //last one
                    {
                        output.Append('\t', i - typesMin + 2);
                        WriteGenericType(output, item.TypeName, i + 1);
                    }
                }

                output.Append(";\n");
            }
        }

        private static void WriteGenericType(StringBuilder output, string type, int index)
        {
            output.Append(type);
            output.Append(index);
            if (index == 0) return;

            output.Append('<');

            for (var i = 0; i < index; i++)
            {
                if (i != 0) output.Append(", ");

                output.Append('T');
                output.Append(i + 1);
            }

            output.Append('>');
        }

        internal int DumpErrors()
        {
            var project = _workspace.CurrentSolution.Projects.First();
            var cu = project.GetCompilationAsync().Result;
            var errors = cu!.GetDiagnostics();
            foreach (var error in errors)
            {
                if (error.Severity == DiagnosticSeverity.Error)
                    Console.WriteLine(error);
            }

            return errors.Count(err => err.Severity == DiagnosticSeverity.Error);
        }

        /// <summary>
        /// 需要导出的范型类型重载
        /// </summary>
        private sealed class GenericTypeOverloads //TODO: remove， 干脆不支持
        {
            public readonly string TypeName;

            public readonly List<TypeDeclarationSyntax> Declarations = new();

            public GenericTypeOverloads(string typeName)
            {
                TypeName = typeName;
            }
        }
    }
}