import stylelint from "stylelint";
import postcss from "postcss";
import postcssAttributes from "postcss-attributes";
import { readFile } from "node:fs/promises";

const deprecatedRuleName = "design-token-attributes/deprecated";
const privateRuleName = "design-token-attributes/private";
const messages = stylelint.utils.ruleMessages(deprecatedRuleName, {
  deprecatedCustomProp(prop) {
    return `Use of deprecated custom property "${prop}" found.`;
  },
  privateCustomProp(prop) {
    return `Use of private custom property "${prop}" found.`;
  },
});
const meta = {
  url: "https://github.com/GarthDB/design-token-attributes/tree/main/packages/stylelint-attributes#readme",
};
const getAttributes = async (source, opts) => {
  return (
    await postcss([postcssAttributes()]).process(source, opts)
  ).messages.filter(
    (message) => message.plugin === postcssAttributes().postcssPlugin,
  );
};
const getValueVars = (value) => {
  const matches = value.match(/var\((--[^,\)]+)/g);
  return matches ? matches.map((match) => match.replace("var(", "")) : [];
};
const privateRuleFunction = (primaryOption, opts) => {
  //TODO: refactor to use the same function as deprecatedRuleFunction
  return async (postcssRoot, postcssResult) => {
    const importFrom = [].concat(Object(opts).importFrom || []);
    const validOptions = stylelint.utils.validateOptions(
      postcssResult,
      deprecatedRuleName,
      {
        /* .. */
      },
    );

    if (!validOptions) {
      return;
    }
    if (isEnabled(primaryOption)) {
      const attributes = await importFrom.reduce(
        async (acc, path) => {
          return [
            ...acc,
            ...(await getAttributes(await readFile(path, "utf8"), {
              ...postcssResult.opts,
              ...{ from: path },
            })),
          ];
        },
        [...(await getAttributes(postcssResult, postcssResult.opts))],
      );
      postcssRoot.walkDecls((decl) => {
        getValueVars(decl.value).forEach((valueVar) => {
          const matchingAttribute = attributes.find(
            (attribute) =>
              attribute.prop === valueVar &&
              attribute.type == "access" &&
              attribute.private,
          );
          if (matchingAttribute) {
            stylelint.utils.report({
              message: messages.privateCustomProp(valueVar),
              node: decl,
              result: postcssResult,
              ruleName: privateRuleName,
            });
          }
        });
      });
    }
  };
};
const deprecatedRuleFunction = (primaryOption, opts) => {
  return async (postcssRoot, postcssResult) => {
    const importFrom = [].concat(Object(opts).importFrom || []);
    const validOptions = stylelint.utils.validateOptions(
      postcssResult,
      deprecatedRuleName,
      {
        /* .. */
      },
    );

    if (!validOptions) {
      return;
    }
    if (isEnabled(primaryOption)) {
      const attributes = await importFrom.reduce(
        async (acc, path) => {
          return [
            ...acc,
            ...(await getAttributes(await readFile(path, "utf8"), {
              ...postcssResult.opts,
              ...{ from: path },
            })),
          ];
        },
        [...(await getAttributes(postcssResult, postcssResult.opts))],
      );
      postcssRoot.walkDecls((decl) => {
        getValueVars(decl.value).forEach((valueVar) => {
          const matchingAttribute = attributes.find(
            (attribute) =>
              attribute.prop === valueVar && attribute.type == "deprecated",
          );
          if (matchingAttribute) {
            stylelint.utils.report({
              message: messages.deprecatedCustomProp(valueVar),
              node: decl,
              result: postcssResult,
              ruleName: deprecatedRuleName,
            });
          }
        });
      });
    }
  };
};

deprecatedRuleFunction.deprecatedRuleName = deprecatedRuleName;
deprecatedRuleFunction.messages = messages;
deprecatedRuleFunction.meta = meta;

export default [
  stylelint.createPlugin(deprecatedRuleName, deprecatedRuleFunction),
  stylelint.createPlugin(privateRuleName, privateRuleFunction),
];

const isEnabled = (method) => method === true;
