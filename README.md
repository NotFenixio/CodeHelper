# CodeHelper

> A GitHub Bot built with [Probot](https://github.com/probot/probot) that can help you fix bugs using AI

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t CodeHelper .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> CodeHelper
```

## Contributing

If you have suggestions for how CodeHelper could be improved, or want to report a bug, open an issue! I'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2023 NotFenixio
