using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    public partial class Emitter
    {
        internal void VisitSeparatedList<T>(SeparatedSyntaxList<T> list) where T : SyntaxNode
        {
            foreach (var item in list.GetWithSeparators())
            {
                if (item.IsToken)
                    VisitToken(item.AsToken());
                else
                    Visit(item.AsNode());
            }
        }

        public override void VisitUsingDirective(UsingDirectiveSyntax node)
        {
            //do nothing now.
        }

        #region ====Declaration====

        public override void VisitNamespaceDeclaration(NamespaceDeclarationSyntax node)
        {
            //暂不处理Namespace
            foreach (var member in node.Members)
            {
                Visit(member);
            }
        }

        public override void VisitFileScopedNamespaceDeclaration(FileScopedNamespaceDeclarationSyntax node)
        {
            //暂不处理Namespace
            foreach (var member in node.Members)
            {
                Visit(member);
            }
        }

        public override void VisitClassDeclaration(ClassDeclarationSyntax node) =>
            ClassDeclarationEmitter.Default.Emit(this, node);

        public override void VisitStructDeclaration(StructDeclarationSyntax node) =>
            StructDeclarationEmitter.Default.Emit(this, node);

        public override void VisitInterfaceDeclaration(InterfaceDeclarationSyntax node) =>
            InterfaceDeclarationEmitter.Default.Emit(this, node);

        public override void VisitEnumDeclaration(EnumDeclarationSyntax node) =>
            EnumDeclarationEmitter.Default.Emit(this, node);

        public override void VisitDelegateDeclaration(DelegateDeclarationSyntax node) =>
            DelegateDeclarationEmitter.Default.Emit(this, node);

        public override void VisitTypeParameter(TypeParameterSyntax node)
        {
            Write(node.Identifier.Text);
        }

        public override void VisitConstructorDeclaration(ConstructorDeclarationSyntax node) =>
            ConstructorDeclarationEmitter.Default.Emit(this, node);

        public override void VisitEventFieldDeclaration(EventFieldDeclarationSyntax node) =>
            EventFieldDeclarationEmitter.Default.Emit(this, node);

        public override void VisitVariableDeclaration(VariableDeclarationSyntax node) =>
            VariableDeclarationEmitter.Default.Emit(this, node);

        public override void VisitVariableDeclarator(VariableDeclaratorSyntax node) =>
            VariableDeclaratorEmitter.Default.Emit(this, node);

        public override void VisitPropertyDeclaration(PropertyDeclarationSyntax node) =>
            PropertyDeclarationEmitter.Default.Emit(this, node);

        public override void VisitMethodDeclaration(MethodDeclarationSyntax node) =>
            MethodDeclarationEmitter.Default.Emit(this, node);

        public override void VisitOperatorDeclaration(OperatorDeclarationSyntax node) =>
            OperatorDeclarationEmitter.Default.Emit(this, node);

        public override void VisitConversionOperatorDeclaration(
            ConversionOperatorDeclarationSyntax node)
        {
            //TODO: 转为静态方法
        }

        public override void VisitParameter(ParameterSyntax node)
        {
            Write(node.Identifier.Text);

            //需要特殊处理抽象方法的默认参数 eg: abstract void SomeMethod(SomeType? para = null);
            var ignoreDefault = node.Default != null &&
                                node.Parent?.Parent is MethodDeclarationSyntax methodDeclaration &&
                                methodDeclaration.HasAbstractModifier();
            if (!ToJavaScript && ignoreDefault &&
                node.Default!.Value is LiteralExpressionSyntax literal &&
                literal.Kind() == SyntaxKind.NullLiteralExpression)
                Write('?');

            if (!ToJavaScript && node.Type != null)
            {
                Write(": ");
                Visit(node.Type);
            }

            if (node.Default != null && !ignoreDefault)
                Visit(node.Default);
        }

        #endregion

        #region ====Statement====

        public override void VisitBlock(BlockSyntax node) =>
            BlockEmitter.Default.Emit(this, node);

        public override void VisitIfStatement(IfStatementSyntax node) =>
            IfStatementEmitter.Default.Emit(this, node);

        public override void VisitForEachStatement(ForEachStatementSyntax node) =>
            ForEachStatementEmitter.Default.Emit(this, node);

        public override void VisitSwitchStatement(SwitchStatementSyntax node) =>
            SwitchStatementEmitter.Default.Emit(this, node);

        public override void VisitTryStatement(TryStatementSyntax node) =>
            TryStatementEmitter.Emit(this, node);

        public override void VisitLocalDeclarationStatement(LocalDeclarationStatementSyntax node) =>
            LocalDeclarationStatementEmitter.Default.Emit(this, node);

        public override void VisitUsingStatement(UsingStatementSyntax node)
        {
            throw new NotImplementedException("UsingStatement");
        }

        #endregion

        #region ====Pattern Expression====

        public override void VisitIsPatternExpression(IsPatternExpressionSyntax node) =>
            IsPatternExpressionEmitter.Default.Emit(this, node);

        #endregion

        #region ====Expression====

        public override void VisitInitializerExpression(InitializerExpressionSyntax node) =>
            InitializerExpressionEmitter.Default.Emit(this, node);

        public override void VisitArgumentList(ArgumentListSyntax node) =>
            VisitSeparatedList(node.Arguments);

        public override void VisitArgument(ArgumentSyntax node) =>
            ArgumentEmitter.Default.Emit(this, node);

        public override void VisitSwitchExpression(SwitchExpressionSyntax node) =>
            SwitchExpressionEmitter.Default.Emit(this, node);

        public override void VisitBinaryExpression(BinaryExpressionSyntax node) =>
            BinaryExpressionEmitter.Default.Emit(this, node);

        public override void VisitMemberAccessExpression(MemberAccessExpressionSyntax node) =>
            MemberAccessExpressionEmitter.Default.Emit(this, node);

        public override void VisitElementAccessExpression(ElementAccessExpressionSyntax node) =>
            ElementAccessExpressionEmitter.Emit(this, node);

        public override void VisitBaseExpression(BaseExpressionSyntax node)
        {
            WriteLeadingTrivia(node);
            Write("super");
        }

        public override void VisitCastExpression(CastExpressionSyntax node)
            => CastExpressionEmitter.Emit(this, node);

        public override void VisitLiteralExpression(LiteralExpressionSyntax node) =>
            LiteralExpressionEmitter.Default.Emit(this, node);

        public override void VisitInterpolatedStringExpression(InterpolatedStringExpressionSyntax node) =>
            InterpolatedStringEmitter.Default.Emit(this, node);

        public override void VisitInterpolatedStringText(InterpolatedStringTextSyntax node) =>
            Write(node.TextToken.Text);

        public override void VisitInterpolation(InterpolationSyntax node)
        {
            Write("${");
            Visit(node.Expression);
            Write('}');
        }

        public override void VisitCheckedExpression(CheckedExpressionSyntax node)
        {
            Visit(node.Expression);
        }

        public override void VisitDefaultExpression(DefaultExpressionSyntax node)
            => throw new NotSupportedException("default(xxx) is not supported");

        public override void VisitTupleExpression(TupleExpressionSyntax node)
        {
            Write('[');
            VisitSeparatedList(node.Arguments);
            Write(']');
        }

        public override void VisitPostfixUnaryExpression(PostfixUnaryExpressionSyntax node)
        {
            if (node.Kind() == SyntaxKind.SuppressNullableWarningExpression && ToJavaScript)
            {
                node.Operand.Accept(this);
                WriteTrailingTrivia(node);
                return;
            }

            base.VisitPostfixUnaryExpression(node);
        }

        #endregion

        #region ====Type====

        public override void VisitNullableType(NullableTypeSyntax node)
        {
            Write("Nullable<");
            DisableVisitLeadingTrivia();
            Visit(node.ElementType);
            EnableVisitLeadingTrivia();
            Write('>');

            WriteTrailingTrivia(node);
        }

        public override void VisitIdentifierName(IdentifierNameSyntax node) =>
            IdentifierNameEmitter.Default.Emit(this, node);

        public override void VisitGenericName(GenericNameSyntax node) =>
            GenericNameEmitter.Default.Emit(this, node);

        public override void VisitPredefinedType(PredefinedTypeSyntax node) =>
            PredefinedTypeEmitter.Default.Emit(this, node);

        public override void VisitQualifiedName(QualifiedNameSyntax node) =>
            QualifiedNameEmitter.Default.Emit(this, node);

        public override void VisitArrayType(ArrayTypeSyntax node) =>
            ArrayTypeEmitter.Emit(this, node);

        #endregion

        #region ====Token & Trivia====

        private bool _disableVisitTrailingTrivia;
        private bool _disableVisitLeadingTrivia;

        internal void DisableVisitLeadingTrivia() => _disableVisitLeadingTrivia = true;

        internal void EnableVisitLeadingTrivia() => _disableVisitLeadingTrivia = false;

        internal void DisableVisitTrailingTrivia() => _disableVisitTrailingTrivia = true;

        internal void EnableVisitTrailingTrivia() => _disableVisitTrailingTrivia = false;

        public override void VisitToken(SyntaxToken token)
        {
            VisitLeadingTrivia(token);
            Write(token.Text);
            VisitTrailingTrivia(token);
        }

        public override void VisitLeadingTrivia(SyntaxToken token)
        {
            if (!_disableVisitLeadingTrivia)
                base.VisitLeadingTrivia(token);
        }

        public override void VisitTrailingTrivia(SyntaxToken token)
        {
            if (!_disableVisitTrailingTrivia)
                base.VisitTrailingTrivia(token);
        }

        public override void VisitTrivia(SyntaxTrivia trivia)
        {
            switch (trivia.Kind())
            {
                case SyntaxKind.EndOfLineTrivia:
                    Write('\n');
                    break;
                case SyntaxKind.WhitespaceTrivia:
                    Write(' ', trivia.Span.Length);
                    break;
                case SyntaxKind.SingleLineCommentTrivia:
                case SyntaxKind.SingleLineDocumentationCommentTrivia:
                    Write(trivia.ToFullString());
                    break;
                case SyntaxKind.MultiLineCommentTrivia:
                    break;
                case SyntaxKind.MultiLineDocumentationCommentTrivia:
                    break;
                case SyntaxKind.IfDirectiveTrivia:
                case SyntaxKind.ElseDirectiveTrivia:
                case SyntaxKind.EndIfDirectiveTrivia:
                case SyntaxKind.DisabledTextTrivia:
                    break;
                default:
                    //TODO:
                    //throw new Exception(trivia.Kind().ToString());
                    break;
            }
        }

        #endregion

        #region ====NotSupported====

        #endregion
    }
}