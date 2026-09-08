import pexpect
import sys

child = pexpect.spawn('eas credentials -p android', encoding='utf-8')
child.logfile = sys.stdout

child.expect('Which build profile do you want to configure')
child.sendline('\r')

child.expect('What do you want to do')
# We need to select Keystore
child.sendline('\r')

# Then it should print the Keystore details
try:
    child.expect('SHA1 fingerprint', timeout=10)
    # read everything after
    print(child.read())
except pexpect.TIMEOUT:
    print("Timed out waiting for SHA1")
