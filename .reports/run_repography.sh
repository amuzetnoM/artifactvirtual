#!/bin/bash

# Adapted from https://sh.rustup.rs (the Rust installer)
# This script downloads and runs the correct Repography analyser for your platform.
# See https://github.com/repography/analyser for details.

set -u

PROGRESS_ID="${1}"

err() {
    say "$1" >&2
    exit 1
}

need_cmd() {
    if ! check_cmd "$1"; then
        err "need '$1' (command not found)"
    fi
}

check_cmd() {
    command -v "$1" > /dev/null 2>&1
}

assert_nz() {
    if [ -z "$1" ]; then err "assert_nz $2"; fi
}

# Run a command that should never fail. If the command fails execution
# will immediately terminate with an error showing the failing
# command.
ensure() {
    if ! "$@"; then err "command failed: $*"; fi
}

# This is just for indicating that commands' results are being
# intentionally ignored. Usually, because it's being executed
# as part of error handling.
ignore() {
    "$@"
}

get_architecture() {
	local _ostype
	_ostype="$(uname -s)"
    case "$_ostype" in
        Linux)
            RETVAL=linux
            ;;
        Darwin)
            RETVAL=mac
            ;;
        MINGW* | MSYS* | CYGWIN*)
            RETVAL=windows
            ;;
        *)
            err "unrecognized OS type: $_ostype"
            ;;
	esac
}

downloader() {
    curl --compressed --proto '=https' --tlsv1.2 --silent --show-error --fail --location "$1" --output "$2"
}

main() {
    need_cmd uname
    need_cmd mktemp
    need_cmd chmod
    need_cmd mkdir
    need_cmd rm
    need_cmd rmdir

    get_architecture || return 1
    local _arch="$RETVAL"
    assert_nz "$_arch" "arch"

    local _ext=""
    if command -v git --version > /dev/null 2>&1; then
		_ext+="-git"
	fi

    case "$_arch" in
        *windows*)
            _ext=".exe"
            ;;
    esac

    local _url="https://cli.repography.com/file/cli-repography-com/repography-${_arch}${_ext}"

    local _dir
    _dir="$(mktemp -d 2>/dev/null || ensure mktemp -d -t repography.XXXXX)"
    local _file="${_dir}/analyser${_ext}"

    printf '%s\n' 'Downloading analyser...' 1>&2

    ensure mkdir -p "$_dir"
    ensure downloader "$_url" "$_file"
    ensure chmod u+x "$_file"
    if [ ! -x "$_file" ]; then
        printf '%s\n' "Cannot execute $_file (likely because of mounting /tmp as noexec)." 1>&2
        printf '%s\n' "Please copy the file to the root of your repo and run: ./analyser${_ext} ${PROGRESS_ID}" 1>&2
        exit 1
    fi

	# The installer is going to want to ask for confirmation by
	# reading stdin.  This script was piped into `sh` though and
	# doesn't have stdin to pass to its children. Instead we're going
	# to explicitly connect /dev/tty to the installer's stdin.
	if [ ! -t 1 ]; then
		err "Unable to run interactively from downloader. Please run: $_file ${PROGRESS_ID}"
	fi

	ignore "$_file" "${PROGRESS_ID}" < /dev/tty

    local _retval=$?

    ignore rm "$_file"
    ignore rmdir "$_dir"

    return "$_retval"
}

main "$@" || exit 1
