#!/bin/bash

printf "\n\033[1;37mSWITCHR SETUP\033[0m\n\n"

ok () {
    printf "\033[1;32m ok! \033[0m\n"
}

error () {
    printf "\033[1;31m missing! \033[0m\n"
}

check () {
    printf "Checking for $1..."

    # [[ "$(which $1 | grep -c $1)" == "1" ]] && return 0 || return 1
    if [ "$(which $1 | grep -c $1)" == "1" ]
    then
        ok

        return 0
    else
        error

        return 1
    fi
}

install() {
    read -p "$1 was not found on your system. Would you like me to install it? [Y/n]: " answer

    if [ "$answer" == "Y" ] || [ "$answer" == "y" ]
    then
        return 0
    else
        return 1
    fi
}

abort() {
    printf "\nSORRY, YOU ARE MISSING \033[1;37mESSENTIAL\033[0m COMPONENTS THAT ARE NEEDED. EXITING SETUP...\n"
}

if ( ! check "django-admin.py" )
then
    if ( install "Django" )
    then
        if ( check "easy_install" )
        then
            easy_install Django
        else
            abort

            exit 1
        fi
    else
        exit 1
    fi
fi

printf "Initialising database..."

python manage.py syncdb --noinput > /dev/null

ok

if ( ! check "lessc" )
then
    if ( install "lessc" )
    then
        if ( ! check "npm" )
        then
            if ( install "npm" )
            then
                if ( check "apt-get" )
                then
                    apt-get install npm
                else
                    abort

                    exit 1
                fi
            else
                exit 1
            fi
        fi

        npm install -g less
    else
        exit 1
    fi
fi

printf "Compiling styles..."

cd $PWD/plan/static/stylesheets/less/ && bash ./compile_styles.sh > /dev/null

ok

if( ! check "send" )
then
    printf "It seems you do not have raspberry remote installed or the send command is not reachable.\n"
    printf "Please make sure switchr can access the send command in order to transmit signals.\n"
fi

printf "\n\033[1;37mSETUP DONE!\033[0m\n\n"
