#!/usr/bin/env bash
#
# Little startup script fetches data dictionary, and runs the relay
# compiler, then webpack before launching nginx
#
set -euo pipefail

export NODE_ENV=production

if [[ "${SKIP_WEBPACK_ON_START:-false}" == "true" && -f /data-portal/bundle.js ]]; then
	echo "INFO: SKIP_WEBPACK_ON_START=true and bundle.js exists - skipping runWebpack"
else
	bash runWebpack.sh
fi

# Ensure BASENAME symlink exists for nginx to serve assets at BASENAME path.
# Guard against BASENAME being unset: the portal deployment does not always set
# it, and under `set -u` an unguarded ${BASENAME#/} would crash startup.
_portal_basename="${BASENAME:-}"
if [[ -n "$_portal_basename" && "$_portal_basename" != "/" && ! -e "/data-portal/${_portal_basename#/}" ]]; then
	ln -s /data-portal "/data-portal/${_portal_basename#/}"
	echo "INFO: Created symlink /data-portal/${_portal_basename#/} -> /data-portal"
fi

exec /usr/sbin/nginx -g 'daemon off;'
