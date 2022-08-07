#!/usr/bin/env bash

# author: https://github.com/InbarRose

if [ $# -lt 1 ]; then
    echo "usage: fix_symlinks.sh <symlink_dir>"
    echo "fix symlinks that have backslashes instead of slashes (such as when copying them into docker from windows)"
    exit 1
fi

set -x # to see commands as they are run (remove line or comment out if you don't want to see what this script is doing)

SYMLINK_DIR=$1
echo "fixing symlinks in ${SYMLINK_DIR}"

# loop over all broken links in the directory
for line in $(find ${SYMLINK_DIR} -xtype l); do
  # build the command that will fix the link
  COMMAND=$(echo `ls -l ${line}` | awk '{print "ln -s " $11 " " $9}' | sed 's/\\/\//g')
  # remove the dead link
  rm ${line}
  # run the command to fix the link
  eval ${COMMAND}
done

echo "finished fixing symlinks in ${SYMLINK_DIR}"
exit 0