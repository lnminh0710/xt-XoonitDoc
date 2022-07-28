using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class BuildTreeHelper
    {
        public class TreeNode<IType, T>
            where T : class
        {
            public IList<TreeNode<IType, T>> Children { get; set; }
            public T Data { get; set; }
            public TreeNode<IType, T> Root { get; set; }

            public TreeNode()
            {
                Root = null;
                Data = null;
                Children = null;
            }
        }

        public class BuildTreeOptions
        {
            public bool ReferenceRoot { get; set; }
        }

        public static BuildTreeOptions GetDefaultOptions()
        {
            return new BuildTreeOptions()
            {
                ReferenceRoot = false
            };
        }


        public static IEnumerable<TreeNode<IType, T>> BuildTree<IType, T>(
            IEnumerable<T> flatData,
            Func<T, IType> getId,
            Func<T, IType> getParentId,
            Func<BuildTreeOptions> optionsFnc = null) where T : class
        {
            TreeNode<IType, T> curNode;
            var lookup = new Dictionary<IType, TreeNode<IType, T>>();
            IList<TreeNode<IType, T>> rootNodes = new List<TreeNode<IType, T>>();

            BuildTreeOptions options = optionsFnc == null ? GetDefaultOptions() : optionsFnc();

            foreach (var item in flatData)
            {
                IType id = getId(item);
                IType parentId = getParentId(item);
                if (lookup.TryGetValue(id, out TreeNode<IType, T> node))
                {
                    curNode = node;
                    curNode.Data = item;
                }
                else
                {
                    curNode = new TreeNode<IType, T>()
                    {
                        Data = item
                    };
                    lookup.Add(id, curNode);
                }

                lookup.TryGetValue(parentId, out TreeNode<IType, T> parentNode);

                // initialize temp parent node with data null
                // in the future, if matching parentNode Id will update Data at the first if statement in this function
                if (parentNode == null)
                {
                    parentNode = new TreeNode<IType, T>
                    {
                        Data = null,
                    };
                    lookup.Add(parentId, parentNode);
                }

                curNode.Root = options.ReferenceRoot ? parentNode : null;
                if (parentNode.Children == null)
                {
                    parentNode.Children = new List<TreeNode<IType, T>>();
                }
                parentNode.Children.Add(curNode);
            }

            if (lookup.Values.Count <= 0)
            {
                return lookup.Values.ToArray();
            }

            return lookup.Values
                         .FirstOrDefault(node => node.Data == null)
                         .Children
                         .ToArray();
        }
    }
}
