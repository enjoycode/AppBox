using System;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class EnumDeclarationEmitter : SyntaxEmitter<EnumDeclarationSyntax>
    {
        internal static readonly EnumDeclarationEmitter Default = new();

        private EnumDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, EnumDeclarationSyntax node)
        {
            if (node.IsTSType(out _))
                return;
            
            var export = node.NeedExport(out var isPublic);
            if (isPublic)
                emitter.AddPublicType(node);
            if (export)
                emitter.Write("export ");

            if (emitter.ToJavaScript)
                EnumToJavaScript(emitter, node);
            else
                EnumToTypeScript(emitter, node);
        }

        private static void EnumToJavaScript(Emitter emitter, EnumDeclarationSyntax node)
        {
            var name = node.Identifier.Text;
            emitter.Write($"var {name};\n");
            emitter.Write($"(function({name}) {{\n");

            var preValue = 0;
            for (var i = 0; i < node.Members.Count; i++)
            {
                var member = node.Members[i];
                var memeberName = node.Identifier.Text;
                var memberValue = member.EqualsValue != null
                    ? int.Parse(member.EqualsValue.Value.ToString())
                    : preValue + 1;
                preValue = memberValue;
                emitter.Write($"    {name}[{name}[\"{memeberName}\"] = {memberValue}] = \"{memeberName}\";");

                if (i != node.Members.Count - 1)
                    emitter.Write('\n');
            }
            
            emitter.Write($"}})({name} || ({name} = {{}}));\n");
        }

        private static void EnumToTypeScript(Emitter emitter, EnumDeclarationSyntax node)
        {
            // enum name
            emitter.Write("enum ");
            emitter.VisitToken(node.Identifier);

            // members
            emitter.VisitToken(node.OpenBraceToken);

            for (var i = 0; i < node.Members.Count; i++)
            {
                var member = node.Members[i];
                emitter.VisitToken(member.Identifier);
                if (member.EqualsValue != null)
                {
                    emitter.Write(" = ");
                    emitter.Visit(member.EqualsValue.Value);
                }

                if (i != node.Members.Count - 1)
                    emitter.Write(",\n");
            }

            emitter.VisitToken(node.CloseBraceToken);
        }
    }
}