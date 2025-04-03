using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class RowStateFromQueryEditor : View
{
    public RowStateFromQueryEditor(DesignController designController, DynamicDataRow rowState)
    {
        _designController = designController;
        _rowState = rowState;
        _entityTarget = MakeStateOfRoot();

        Child = BuildBody();

        if (_entityTarget.Value != null)
            _treeController.DataSource = EntityModelUtils.GetEntityModelMembers((EntityModel)_entityTarget.Value.Model);
        _selectsController.DataSource = RowFromQuery.Selects;
    }

    private readonly DesignController _designController;
    private readonly DynamicDataRow _rowState;
    private readonly TreeController<EntityMemberModel> _treeController = new();
    private readonly DataGridController<DynamicQuery.SelectItem> _selectsController = new();
    private DynamicRowFromQuery RowFromQuery => (DynamicRowFromQuery)_rowState.Source;
    private readonly State<ModelNode?> _entityTarget;

    private RxProxy<ModelNode?> MakeStateOfRoot() => new(
        () =>
        {
            if (Expression.IsNull(RowFromQuery.Root))
                return null;
            var rootModelId = RowFromQuery.Root!.ModelId;
            return DesignHub.Current.DesignTree.FindModelNode(rootModelId);
        },
        node =>
        {
            RowFromQuery.Selects.Clear();
            if (node == null)
            {
                RowFromQuery.Root = null;
                RowFromQuery.PrimaryKeys = [];
            }
            else
            {
                var entityModel = (EntityModel)node.Model;
                RowFromQuery.Root = new EntityExpression(entityModel, null);
                var sqlPks = entityModel.SqlStoreOptions!.PrimaryKeys;
                RowFromQuery.PrimaryKeys = new DynamicRowFromQuery.PrimaryKey[sqlPks.Length];
                for (var i = 0; i < sqlPks.Length; i++)
                {
                    var member = (EntityFieldModel)entityModel.GetMember(sqlPks[i].MemberId)!;
                    RowFromQuery.PrimaryKeys[i] = new DynamicRowFromQuery.PrimaryKey(member.Name,
                        DynamicField.FlagFromEntityFieldType(member.FieldType));
                }

                _treeController.DataSource = EntityModelUtils.GetEntityModelMembers(entityModel);
            }
        }
    );

    private Row BuildBody() => new Row(VerticalAlignment.Top)
    {
        Children =
        [
            new Card()
            {
                Width = 200,
                Child = new Column()
                {
                    Children =
                    [
                        new Select<ModelNode>(_entityTarget)
                        {
                            Options = EntityModelUtils.GetAllSqlEntityModels(),
                            LabelGetter = node => $"{node.AppNode.Label}.{node.Label}"
                        },
                        new Expanded(new TreeView<EntityMemberModel>(_treeController, BuildTreeNode, m =>
                            {
                                var entityRef = (EntityRefModel)m;
                                if (entityRef.IsAggregationRef)
                                    throw new NotImplementedException();
                                var refModel =
                                    (EntityModel)DesignHub.Current.DesignTree.FindModelNode(entityRef.RefModelIds[0])!
                                        .Model;
                                return EntityModelUtils.GetEntityModelMembers(refModel);
                            })
                            {
                                AllowDrag = true,
                                OnAllowDrag = node => node.Data is not EntityRefModel
                            }
                        )
                    ]
                }
            },
            new Expanded(new Card()
            {
                Child = BuildDataGridForSelects()
            })
        ]
    };

    private static void BuildTreeNode(TreeNode<EntityMemberModel> node)
    {
        var member = node.Data;
        node.Label = new Text(member.Name);
        node.Icon = member is EntityRefModel ? new(MaterialIcons.Folder) : new(MaterialIcons.TextFields);
        node.IsLeaf = member is not EntityRefModel;
        node.IsExpanded = true;
    }

    private Widget BuildDataGridForSelects()
    {
        return new DataGrid<DynamicQuery.SelectItem>(_selectsController)
            {
                AllowDrop = true,
                OnAllowDrop = OnAllowDropTo,
                OnDrop = OnDropToSelects
            }
            .AddTextColumn("Item", t => t.Item.ToString())
            .AddButtonColumn("Action", (_, index) => new Button(icon: MaterialIcons.Clear)
            {
                Style = ButtonStyle.Transparent,
                Shape = ButtonShape.Pills,
                FontSize = 20,
                OnTap = _ => _selectsController.RemoveAt(index)
            }, 80);
    }

    private static bool OnAllowDropTo(DragEvent dragEvent)
    {
        if (dragEvent.TransferItem is TreeNode<EntityMemberModel> { Data: EntityFieldModel })
            return true;
        return false;
    }

    private void OnDropToSelects(DragEvent dragEvent)
    {
        var treeNode = (TreeNode<EntityMemberModel>)dragEvent.TransferItem;
        //构建路径表达式
        var exp = EntityModelUtils.BuildExpressionFrom(treeNode, RowFromQuery.Root!);
        var selectItem = new DynamicQuery.SelectItem(exp.GetFieldAlias(), exp,
            DynamicField.FlagFromEntityFieldType(((EntityFieldModel)treeNode.Data).FieldType));
        _selectsController.Add(selectItem);
    }
}