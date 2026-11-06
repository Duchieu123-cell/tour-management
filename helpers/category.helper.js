const buildCategoryTree = (categories, parentID = "") => {
  const tree = [];
  categories.forEach(item => {
    if(item.parent == parentID){
      const children = buildCategoryTree(categories, item._id);

      tree.push({
        id: item._id,
        name: item.name,
        slug: item.slug,
        children: children
      })
    }
  });
  return tree;
}

module.exports.buildCategoryTree = buildCategoryTree;