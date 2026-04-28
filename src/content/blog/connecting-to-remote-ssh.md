---
title: 'Connecting to a remote host using RSA keys'
date: 2019-01-09
description: 'Quality of life Configuration for SSH connection'
---

1\. Create a new key pair (specify a name: for example, **myhost**. The file name is specified with the full path to the directory \~/.ssh/**myhost**)

```bash
$ ssh-keygen -t rsa -C "user@gmail.com"
```

2\. Add the created key to ssh-agent.

```bash
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/myhost
```

3\. Copy the public key to the host.

```bash
$ ssh-copy-id -i ~/.ssh/myhost.pub username@hostname.com
```

4\. Create a configuration file for convenient connection to the host.

```bash
$ nano ~/.ssh/config
```

File contents:

    Host myhost
      HostName hostname.com
      User username
      RSAAuthentication yes
      IdentityFile ~/.ssh/myhost

5\. Profit\! You can connect to the host using:

```bash
$ ssh myhost
```
