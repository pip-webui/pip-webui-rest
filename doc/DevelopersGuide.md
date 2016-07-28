# Pip.WebUI.Rest Developer's Guide

## <a name="contents"></a> Contents

* [Installing](#install)
* [Building](#build)
* [Testing](#test)
* [Publishing](#publish)
* [Releasing](#release)
* [Contributing](#contrib)

## <a name="install"></a> Installing

1\. - Download and install Node.js from https://nodejs.org/en/download/

2\. - Install required build and test tools.

```bash
npm install gulp-cli -g
npm install mocha -g
```

3\. Clone the project from github repository.

```bash
git clone https://github.com/pip-webui/pip-webui-rest.git
```

4\. Install project dependencies.

Install all dependencies for the first time:
```bash
npm install
```

Or update dependencies after they were installed:
```bash
npm update
```

## <a name="build"></a> Building

Clean **/build** and **/dist** directories. It is an optional step to ensure you removed any garbage.
```bash
gulp clean
```

Build source code. It will automatically check for errors and regenerate API documentation.
If any error found the build will fail.
```
gulp build
```

## <a name="test"></a> Testing

Execute unit tests:
```bash
gulp test
```

Check for errors in coding style:
```bash
gulp eslint
```

Launch samples locally:
```bash
gulp launch
```

## <a name="publish"></a> Publishing

Uploading samples and API documentation to S3 static websites:
```
gulp publish
```

## <a name="release"></a> Releasing

1\. Check and update **CHANGELOG.md** file.

2\. Change version number in package.json. Remember: use semantic version and push changes to git repository.

3\. Set tag corresponding to the module version.

```bash
git tag vx.y.z
git push origin master --tags
```

4\. Publish release to the global NPM repository.

Remember: to publish to NPM you must have proper permissions from the team.
```bash
npm login
npm publish
```

## <a name="contrib"></a> Contributing

For those who would like to contribute to the project as external contributor or become a part of Pip.WebUI team, 
please, read [Contributor's Guide](https://github.com/pip-webui/pip-webui/blob/master/doc/ContributorsGuide.md).
