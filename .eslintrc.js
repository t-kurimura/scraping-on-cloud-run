module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier", "import"],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    rules: {
        "prettier/prettier": "error",
        "import/order": [
            "error",
            {
                "groups": [["builtin", "external"], "internal"],
                "newlines-between": "always",
            },
        ],
    }
};