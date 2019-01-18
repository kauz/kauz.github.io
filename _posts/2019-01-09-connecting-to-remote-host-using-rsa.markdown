---
layout: post
title:  "Подключение к удаленному хосту с использованием ключей RSA"
categories: ssh
---

1\. Создать новую пару ключей (указать имя: например **myhost**. Имя файла указывается с полным путём к директории \~/.ssh/**myhost**)


{% highlight console %}
$ ssh-keygen -t rsa -C "user@gmail.com"
{% endhighlight %}

2\. Добавить созданный ключ в ssh-agent.

{% highlight console %}
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/myhost
{% endhighlight %}

3\. Скопировать публичный ключ на хост.

{% highlight console %}
$ ssh-copy-id -i ~/.ssh/myhost.pub username@hostname.com
{% endhighlight %}

4\. Создать файл конфигурации для удобного соединения с хостом.

{% highlight console %}
$ nano ~/.ssh/config
{% endhighlight %}

Содержимое файла:

    Host myhost
      HostName hostname.com
      User username
      RSAAuthentication yes
      IdentityFile ~/.ssh/myhost

5\. Профит\! Можно коннектиться к хосту с помощью:

{% highlight console %}
$ ssh myhost
{% endhighlight %}
