## Motivation

Setting up the infrastructure for new projects can be quite a pain in the \*\*\*. Even after the initial setup is done, adding new developers to the team requires a lot of time. Besides explaining the project to the new team member, the project's development environment has to be installed of the new developer's computer. This includes setting up virtual machines, web- and database-servers, updating libraries et cetera.

Many IT companies use the same technologies repeatedly which leaves them with multiple development environments that look very similar but have been set up separately. This problem can be solved by using a configuration management software and a smart tool for handling virtual machines.
<!--more-->

## @Mayflower
At Mayflower, we are developing PHP and JavaScript applications with modern frameworks like Symfony2 and Backbone.js. Having such technology stacks in multiple customer projects, we can make use of this similarity and improve our workflows. One obvious improvement is the reuse of system configurations. We achieved it by introducing Vagrant and Puppet. We did this quite some time ago now (> 1 year) and use these tools to create development environments that imitate our applications' target platforms as good as possible.

Before that, our teams were working with regular virtual machines - one for each project. When a new developer joined the team, the virtual machine was copied to his computer using an USB drive. This was a good solution which worked quite good. Nevertheless, there was one problem: even the slightest change to the machine's configuration required one developer to save his machine's disk image onto an USB drive and transfer it to the other developers' computers. They had to configure their development environment to use this new image and restart their virtual machines.

When our system administrators started to use Puppet and encouraged developer teams to follow their lead, many people were doubtful or even intimidated by the new technology. A few months later, everybody was using Vagrant and Puppet and nobody wanted to work without it again.

In the meantime, I set up Vagrant/Puppet environments for at least five new projects. Having spent (and billed) a lot of time on configuring similar infrastructures again and again, I am currently working on some ideas that might lead to more efficient solutions.

## Vagrant ^ Puppet
Sadly, the scope of this article is way too limited to provide a comprehensive guide on the usage of Vagrant and Puppet. Having said that, I would still like to give you a quick overview.

**Vagrant** is a software that enables you to manage virtual machines from the command line. You can create new ones very quickly using templates (*Base Boxes*), and apply software configurations to them.

<a href="https://blog.mayflower.de/wp-content/uploads/2012/11/Vagrant-Workflow.png"><img src="https://blog.mayflower.de/wp-content/uploads/2012/11/Vagrant-Workflow.png" alt="" title="Vagrant-Workflow" width="452" height="147" class="aligncenter size-full wp-image-1736" /></a>

After you created and started a virtual machine with Vagrant, **Puppet** enters the stage. With Puppet, you describe a system's configuration via so-called *Manifests*. Manifests contain statements (*Facts*) like "The system has the package apache2 is installed". These facts are read by Puppet and transformed into configuration rules. When you run Puppet and everything went fine, all defined *Facts* are now facts of the virtual machine. The machine's configuration now matches your manifests!

## Let's dig in

Setting up a new Vagrant environment is easy:

1. [Install vagrant](http://vagrantup.com/v1/docs/getting-started/index.html)
1. Execute `vagrant init` in your project's directory
1. Customize the generated `Vagrantfile`

In a `Vagrantfile`, you can adjust the external behavior of your machine. This includes its network adapters, whether it should use puppet, the memory size etc. For a complete list of configuration options, have a look at the [vagrant documentation](http://vagrantup.com/v1/docs/vagrantfile.html).

If you want to make use of puppet, you have to add the following lines:

    config.vm.provision :puppet do |puppet|
        puppet.manifests_path = "puppet"
        puppet.manifest_file  = "myProject.pp"
        puppet.module_path    = "puppet/modules"
    end

This configuration will make Puppet take the file `puppet/myProject.pp` as its main manifest and load third-party modules from `puppet/modules`. Each time you re-create your virtual machine, vagrant will trigger Puppet, which will use your manifests and configure the machine.

In `puppet/myProject.pp`, you probably want to include other manifests that contain the actual facts. This way, you don't mix concerns and keep your facts structured.

Here is an example of a main manifest:

    include myProject::tools
    include myProject::webserver
    include myProject::php

Each of the included manifests should be placed in the folder `puppet/myProject/`:

    puppet/myProject/php.pp
    puppet/myProject/tools.pp
    puppet/myProject/webserver.pp

Inside of these manifests, you declare classes that group facts about one feature:

`puppet/myProject/php.pp`:

    class myProject::php {
        package {["php5", "php5-fpm", "php-apc", "php5-mysql"]:
            ensure => present,
            notify => Service["nginx"],
        },
        ...
    }

There are a lot of good puppet tutorials and examples on the internet which explain how to write manifests for LAMP servers. If you are completely new to Puppet, you might want to ask somebody for help. I think the easiest way to learn it is by starting with a good example and modify it until it matches your requirements.

## Supporting Symfony2 Environments

I recently found a [discussion on Github](https://github.com/symfony/symfony-standard/pull/407) about providing a simple way of starting new Symfony2 projects. The idea is to extend the framework's standard [distribution](http://symfony.com/distributions) by adding a default vagrant/puppet configuration. New projects would already contain a complete development environment. However, this solution would have to be really flexible. Otherwise, the resulting virtual machines couldn't be like the target servers. Therefore, I don't really like the idea of putting this into the standard edition.
So I started working on a [project](https://github.com/ericclemmons/ECVagrantBundle) that uses a different approach: It provides Symfony2 console commands that can generate and configure vagrant/puppet environments for the current project. 

My aim is to bring this bundle to a point where you can configure a whole infrastructure interactively with just one console command. Nevertheless, I like the idea of a simple configuration that is included in a Symfony2 distribution. Developers that are new to Symfony2 would just need to run two console commands (`composer create-project the-new-symfony-distribution` and `vagrant up`) to set up a new virtual machine with their newly created project up and running! With these two solutions at hand, beginning new projects would be a matter of minutes. 

## References

- [Pull-Request by @chregu](https://github.com/symfony/symfony-standard/pull/407)
- [Pull-Request by @ericclemons](https://github.com/symfony/symfony-standard/pull/423)
- [ECVagrantBundle by @ericclemons](https://github.com/ericclemmons/ECVagrantBundle)
- [Vagrant Docs](http://vagrantup.com/v1/docs/index.html)
- [Puppet Docs](http://docs.puppetlabs.com/#puppetpuppet)