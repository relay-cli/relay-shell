# Security

## Reporting

Please report a vulnerability privately through GitHub's security advisory form for this repository. Include a minimal reproduction and the affected version.

## Terminal output

Relay Shell renders whatever text an application passes to it. Applications that display untrusted input, such as log lines or command output, should strip terminal control sequences before rendering them so the input cannot move the cursor or change terminal settings.
