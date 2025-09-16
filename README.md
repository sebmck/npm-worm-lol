> [!IMPORTANT]  
> This repo is from 2016, back when this sort of attack was theoretical[^1][^2]. Now it's common place and npm packages are being taken over weekly[^3]. The implementation in this repo is weak compared to what is being actively deployed today. For posterity, this repo is made public.
> 
> [^1]: https://www.kb.cert.org/vuls/id/319816
> [^2]: https://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability
> [^3]: https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages

# npm-worm-lol

Steps:

1. Add to a popular package.
2. Watch it spread.
3. Publish new version of worm package with malicious code in `payload.js`.
4. ???

## How does it work?

1. The worm package is installed.
2. An npm install script launches two processes that are executed in parallel as daemons.

### Payload installation daemon

Process 1 launches the payload installation process.

1. Copies the `payload` directory to the system.
2. Launches the payload daemon.
  1. Two process are launched that both watch each other. If you attempt to terminate one then it's relaunched by it's sibling.
  2. On launch the processes save their scripts to memory and watch the file system for modifications. If they're deleted then they recreate themselves with the original source.
  3. TCP client is launched that attempts to connect to a remote server. When a command is received it executes it and sends back the stdout.
3. Attempts to install the daemon as a startup process.

### Worm distribution daemon

Process 2 distributes the worm to all npm packages owned by the current user.

1. All packages owned by the current npm user are retrieved.
2. Each package is installed into a dummy directory.
3. The `package.json` of each package is then modified:
  - The patch `version` is bumped.
  - Our worm is added to the `dependencies`.
4. The newly modified packages are published to npm.
