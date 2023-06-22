# generate

Command line for create a project with your own templates

see: https://medium.com/@pongsatt/how-to-build-your-own-project-templates-using-node-cli-c976d3109129

### How to use

```
gen
```

or

```
gen -n project-name -t template-name
```

### Build

```
cd generate
npm install
bpm run build
```

### Install

```
cd generate
npm link
```

or

```
npm install -g path/to/generate
```

### Adding Templates

```
cd generate/templates
mkdir new-template
npm run template
```
