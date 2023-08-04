const attributeRegex = /@(deprecated)(?:\(([^\)]+)\))?/;
const parseAttribute = (comment) => {
  const matches = comment.match(attributeRegex);
  return matches[2]
    ? {
        type: matches[1],
        ...JSON.parse(
          `{${matches[2].replace(
            /(['"])?([a-zA-Z0-9_]+)(['"])?:([^\/])/g,
            '"$2":$4',
          )}}`,
        ),
      }
    : { type: matches[1] };
};
const pluginName = "postcss-attributes";
const plugin = (opts = {}) => {
  return {
    postcssPlugin: pluginName,
    Declaration(decl, { result }) {
      if (
        decl.prop.startsWith("--") &&
        decl.prev() &&
        decl.prev().type === "comment" &&
        decl.prev().text.startsWith("@deprecated")
      ) {
        decl.deprecated = true;
        result.messages.push({
          plugin: pluginName,
          prop: decl.prop,
          ...parseAttribute(decl.prev().text),
        });
      }
    },
  };
};
plugin.postcss = true;
export default plugin;
