#!/bin/bash
echo "=== Debug Keystore SHA-1 ==="
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
