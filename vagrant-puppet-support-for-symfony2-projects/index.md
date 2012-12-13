## Motivation

Setting up the infrastructure for new projects can be quite a pain in the \*\*\*. Even after the initial setup is done, adding new developers to the team requires a lot of time. Besides explaining the project to the new team member, the project's development environment has to be installed of the new developer's computer. This includes setting up virtual machines, web- and database-servers, updating libraries and so on. 

Many IT companies use the same technologies repeatedly which leaves them with multiple development environments that look very similar but have been set up separately. This problem can be solved by using a configuration management tool like Puppet combined with a smart way of handling virtual machines.
<!--more-->

## @Mayflower
At Mayflower, we are developing PHP and JavaScript applications with modern frameworks like Symfony2 and Backbone.js. Having many customer projects with this technology stack, we can think of ways to improve our workflows. One thing we started some time ago (> 1 year now), was using Vagrant and Puppet to set up virtual machines that imitate our applications' target platforms as good as possible.

Before that, each of our teams was working with virtual machines that were copied to new computers using USB drives. The problem was that even the slightest change to the virtual machine required multiple developers to spend time on copying the new image from the shared storage to their computers, configuring it as their virtual machine's new disk image and restart their whole development environment.

When our system administrators started to use Puppet and encouraged developer teams to follow their lead, many people were doubtful or even intimidated by the new technology.
A few months later, everybody is using Vagrant and Puppet and nobody wants to work without it anymore. In the meantime, I set up at least five projects that started from scratch with Vagrant and Puppet. Having seen a lot of time being spent on defining similar infrastructures with Puppet again and again, I am currently working on some ideas that might lead to more efficient solutions.

## Vagrant ^ Puppet
Sadly, the scope of this article is way too limited to provide a comprehensive guide on the usage of Vagrant and Puppet. Nevertheless, I would like to give you a very short introduction.

**Vagrant** is a software that enables you to manage virtual machines from the command line, initialize them very quickly using templates (*Base Boxes*), and apply software configurations to them.

<a href="https://blog.mayflower.de/wp-content/uploads/2012/11/Vagrant-Workflow.png"><img src="https://blog.mayflower.de/wp-content/uploads/2012/11/Vagrant-Workflow.png" alt="" title="Vagrant-Workflow" width="452" height="147" class="aligncenter size-full wp-image-1736" /></a>

After a virtual machine has been created by Vagrant, **Puppet** enters the stage. With Puppet, you describe a system's configuration via so-called *Manifests*. Manifests contain facts about systems which are used by Puppet to make sure that the system matches these facts. Such facts might be that a certain software package is installed, or that a file has to be present with a certain content. After running Puppet, you can be sure that either all facts defined in the manifests are now facts about your virtual machine, or that you can read why your configuration could not be applied.

## Let's dig in

Setting up a new Vagrant environment is easy:

1. [Install vagrant](http://vagrantup.com/v1/docs/getting-started/index.html)
1. Execute `vagrant init` in your project's directory
1. Customize the generated `Vagrantfile`

In your `Vagrantfile`, you can adjust the external behavior of your machine. For a reference about possible configurations, have a look at the [vagrant documentation](http://vagrantup.com/v1/docs/vagrantfile.html).

To use puppet, you have to configure a provisioner:

    config.vm.provision :puppet do |puppet|
        puppet.manifests_path = "puppet"
        puppet.manifest_file  = "myProject.pp"
        puppet.module_path    = "puppet/modules"
    end

This configuration will make Puppet take the file `puppet/myProject.pp` as its main manifest and load third-party modules from `puppet/modules`. Each time you re-create your virtual machine, vagrant will trigger Puppet, which will use your manifests and configure the machine.

In `puppet/myProject.pp`, you probably want to include other manifests that contain the actual facts. This way, you don't mix concerns and can organize manifests better.

Here is an example of a main manifest:

    include myProject::tools
    include myProject::webserver
    include myProject::php

Each of the included manifests should be placed in the folder `puppet/myProject/`:

    puppet/myProject/php.pp
    puppet/myProject/tools.pp
    puppet/myProject/webserver.pp

Inside of these manifest, you have to declare a class that contains facts about the corresponding feature:

`puppet/myProject/php.pp`:

    class myProject::php {
        package {["php5", "php5-fpm", "php-apc", "php5-mysql"]:
            ensure => present,
            notify => Service["nginx"],
        },
        ...
    }

There are a lot of good puppet tutorials and examples on the internet which explain how to configure web servers. If you are completely new to Puppet, you should consider asking for some help. I think the easiest way to learn it is by starting with a good example and modify it until it matches your requirements.

## Supporting Symfony2 Environments

I recently found a [discussion on Github](https://github.com/symfony/symfony-standard/pull/407) about offering a simple way for Symfony2 developers to start new projects. The idea is to extend the framework's standard [distribution](http://symfony.com/distributions) by adding a default vagrant/puppet configuration. I don't really like the idea of putting this into the standard edition, but making something easier is always good! So I started helping out on a [project](https://github.com/ericclemmons/ECVagrantBundle) that uses a different approach: It provides Symfony2 console commands that can generate and configure a vagrant/puppet environment for a project. 

My aim is to bring this bundle to a point where you can configure a whole environment interactively with just one console command. Nevertheless, I like the idea of a very simplistic configuration that is included in a Symfony2 distribution. Developers that are new to Symfony2 would just have to run two console commands (`composer create-project the-new-symfony-distribution` and `vagrant up`) to set up a new virtual machine with their newly created project up and running! With these two solutions at hand, beginning new projects would be a matter of minutes. 
