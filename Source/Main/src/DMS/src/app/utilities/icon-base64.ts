const rotateIcon =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMThweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTggMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogc2tldGNodG9vbCA2My4xICgxMDEwMTApIC0gaHR0cHM6Ly9za2V0Y2guY29tIC0tPgogICAgPHRpdGxlPjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggc2tldGNodG9vbC48L2Rlc2M+CiAgICA8ZyBpZD0iV2ViIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iMS41LURhdGEtY2FwdHVyZS0iIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMDY2LjAwMDAwMCwgLTE0Ny4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9Imljb25zcGFjZV9Sb3RhdGUtQ29weS0zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDc1LjAwMDAwMCwgMTU2LjAwMDAwMCkgc2NhbGUoLTEsIDEpIHRyYW5zbGF0ZSgtMTA3NS4wMDAwMDAsIC0xNTYuMDAwMDAwKSB0cmFuc2xhdGUoMTA2MS4wMDAwMDAsIDE0Mi4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik03LjUyOTMwOTI4LDguNzgxMzQ4MDMgQzkuMDkwODM1MDMsNi44NDU5Njg1NSAxMS40NDgzNzQ0LDUuNjg3NSAxNCw1LjY4NzUgQzE4LjU5MDg2Nyw1LjY4NzUgMjIuMzEyNSw5LjQwOTEzMzAyIDIyLjMxMjUsMTQgQzIyLjMxMjUsMTguNTkwODY3IDE4LjU5MDg2NywyMi4zMTI1IDE0LDIyLjMxMjUgQzEwLjI3MjQ2MTYsMjIuMzEyNSA3LjAzMDY5NDMzLDE5LjgzNzQ4ODEgNi4wMTI0NDY4LDE2LjMwODc5NjkgQzUuOTMxNzI2ODUsMTYuMDI5MDY1NSA2LjE0MTY1MDkzLDE1Ljc1IDYuNDMyNzk1ODMsMTUuNzUgTDguMjc3MTc1MjIsMTUuNzUgQzguNDU4NDk5MywxNS43NSA4LjYyMTAzMTc5LDE1Ljg2MTg1MDkgOC42ODU4MDY4MywxNi4wMzEyMTAzIEM5LjUyMTA4NTY2LDE4LjIxNTExMjUgMTEuNjIyNDM0NiwxOS42ODc1IDE0LDE5LjY4NzUgQzE3LjE0MTExOTUsMTkuNjg3NSAxOS42ODc1LDE3LjE0MTExOTUgMTkuNjg3NSwxNCBDMTkuNjg3NSwxMC44NTg4ODA1IDE3LjE0MTExOTUsOC4zMTI1IDE0LDguMzEyNSBDMTIuMTAzOTkxOCw4LjMxMjUgMTAuMzY5NzU4OCw5LjI0NzQzNjk0IDkuMzE4NDE5ODEsMTAuNzY5MjQ4NiBMMTAuMzg3NjkxMiwxMS45NTczMjc5IEMxMC42NDEwNzgyLDEyLjIzODg2OSAxMC40NDEyNzQ4LDEyLjY4NzUgMTAuMDYyNSwxMi42ODc1IEw2LjEyNSwxMi42ODc1IEM1Ljg4MzM3NTQyLDEyLjY4NzUgNS42ODc1LDEyLjQ5MTYyNDYgNS42ODc1LDEyLjI1IEw1LjY4NzUsNy44NzUgQzUuNjg3NSw3LjQ3NDAzODE4IDYuMTgxOTYxODgsNy4yODQyOTUzNiA2LjQ1MDE5MTE5LDcuNTgyMzI3OTMgTDcuNTI5MzA5MjgsOC43ODEzNDgwMyBaIiBpZD0iU2hhcGUiIGZpbGw9IiMxNTRFODQiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE0LDIxLjQzNzUgQzE4LjEwNzYxNzgsMjEuNDM3NSAyMS40Mzc1LDE4LjEwNzYxNzggMjEuNDM3NSwxNCBDMjEuNDM3NSw5Ljg5MjM4MjE3IDE4LjEwNzYxNzgsNi41NjI1IDE0LDYuNTYyNSBDMTEuNTUwMjQ3Miw2LjU2MjUgOS4zMDE2NzY3Niw3Ljc1NDk4MTc0IDcuOTE2NDQyMzYsOS43MjAyMjEyOSBDNy43NTQ2Mzg2Niw5Ljk0OTc3MzA5IDcuNDIxNTMyOTcsOS45Njk1ODc4IDcuMjMzNjU2OTEsOS43NjA4MzY2MyBMNi41NjI1LDkuMDE1MTA2NzIgTDYuNTYyNSwxMS44MTI1IEw5LjA4MDE1Mzk1LDExLjgxMjUgTDguNDQzNTQxMDIsMTEuMTA1MTUyMyBDOC4zMTQxMTM3MiwxMC45NjEzNDQyIDguMjk0NTEyMDgsMTAuNzQ5NjAxNyA4LjM5NTM0MDY1LDEwLjU4NDQ3ODEgQzkuNTc5MjM3MjUsOC42NDU2NTAwMiAxMS42ODU2NzY1LDcuNDM3NSAxNCw3LjQzNzUgQzE3LjYyNDM2ODcsNy40Mzc1IDIwLjU2MjUsMTAuMzc1NjMxMyAyMC41NjI1LDE0IEMyMC41NjI1LDE3LjYyNDM2ODcgMTcuNjI0MzY4NywyMC41NjI1IDE0LDIwLjU2MjUgQzExLjM2MDEzOTQsMjAuNTYyNSA5LjAxNTQzMzkyLDE4Ljk4OTI2ODkgNy45ODM2MDkyNCwxNi42MjUgTDcuMDM4NjU2MTIsMTYuNjI1IEM4LjExNDM1ODkzLDE5LjQ4MTA1ODUgMTAuODY1MzQ3LDIxLjQzNzUgMTQsMjEuNDM3NSBaIiBpZD0iU2hhcGUiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgICAgICAgICAgICAgPCEtLSA8cG9seWdvbiBpZD0iU2hhcGUiIGZpbGw9IiNGRkMyMDAiIHBvaW50cz0iNy40Mzc1IDE4LjM3NSA5LjYyNSAxOC4zNzUgOC43NSAxNy4wNjI1IDcgMTcuMDYyNSI+PC9wb2x5Z29uPiAtLT4KICAgICAgICAgICAgICAgIDwhLS0gPHBvbHlnb24gaWQ9IlNoYXBlIiBmaWxsPSIjNTJBQkUyIiBwb2ludHM9IjguNzUgMTcuNSA3IDE3LjUgNi41NjI1IDE2LjYyNSA2LjU2MjUgMTYuMTg3NSA4LjMxMjUgMTYuMTg3NSA4LjMxMjUgMTYuNjI1Ij48L3BvbHlnb24+IC0tPgogICAgICAgICAgICAgICAgPCEtLSA8cGF0aCBkPSJNNy41MjkzMDkyOCw4Ljc4MTM0ODAzIEM5LjA5MDgzNTAzLDYuODQ1OTY4NTUgMTEuNDQ4Mzc0NCw1LjY4NzUgMTQsNS42ODc1IEMxOC41OTA4NjcsNS42ODc1IDIyLjMxMjUsOS40MDkxMzMwMiAyMi4zMTI1LDE0IEMyMi4zMTI1LDE4LjU5MDg2NyAxOC41OTA4NjcsMjIuMzEyNSAxNCwyMi4zMTI1IEMxMC4yNzI0NjE2LDIyLjMxMjUgNy4wMzA2OTQzMywxOS44Mzc0ODgxIDYuMDEyNDQ2OCwxNi4zMDg3OTY5IEM1LjkzMTcyNjg1LDE2LjAyOTA2NTUgNi4xNDE2NTA5MywxNS43NSA2LjQzMjc5NTgzLDE1Ljc1IEw4LjI3NzE3NTIyLDE1Ljc1IEM4LjQ1ODQ5OTMsMTUuNzUgOC42MjEwMzE3OSwxNS44NjE4NTA5IDguNjg1ODA2ODMsMTYuMDMxMjEwMyBDOS41MjEwODU2NiwxOC4yMTUxMTI1IDExLjYyMjQzNDYsMTkuNjg3NSAxNCwxOS42ODc1IEMxNy4xNDExMTk1LDE5LjY4NzUgMTkuNjg3NSwxNy4xNDExMTk1IDE5LjY4NzUsMTQgQzE5LjY4NzUsMTAuODU4ODgwNSAxNy4xNDExMTk1LDguMzEyNSAxNCw4LjMxMjUgQzEyLjEwMzk5MTgsOC4zMTI1IDEwLjM2OTc1ODgsOS4yNDc0MzY5NCA5LjMxODQxOTgxLDEwLjc2OTI0ODYgTDEwLjM4NzY5MTIsMTEuOTU3MzI3OSBDMTAuNjQxMDc4MiwxMi4yMzg4NjkgMTAuNDQxMjc0OCwxMi42ODc1IDEwLjA2MjUsMTIuNjg3NSBMNi4xMjUsMTIuNjg3NSBDNS44ODMzNzU0MiwxMi42ODc1IDUuNjg3NSwxMi40OTE2MjQ2IDUuNjg3NSwxMi4yNSBMNS42ODc1LDcuODc1IEM1LjY4NzUsNy40NzQwMzgxOCA2LjE4MTk2MTg4LDcuMjg0Mjk1MzYgNi40NTAxOTExOSw3LjU4MjMyNzkzIEw3LjUyOTMwOTI4LDguNzgxMzQ4MDMgWiBNMTQsMjEuNDM3NSBDMTguMTA3NjE3OCwyMS40Mzc1IDIxLjQzNzUsMTguMTA3NjE3OCAyMS40Mzc1LDE0IEMyMS40Mzc1LDkuODkyMzgyMTcgMTguMTA3NjE3OCw2LjU2MjUgMTQsNi41NjI1IEMxMS41NTAyNDcyLDYuNTYyNSA5LjMwMTY3Njc2LDcuNzU0OTgxNzQgNy45MTY0NDIzNiw5LjcyMDIyMTI5IEM3Ljc1NDYzODY2LDkuOTQ5NzczMDkgNy40MjE1MzI5Nyw5Ljk2OTU4NzggNy4yMzM2NTY5MSw5Ljc2MDgzNjYzIEw2LjU2MjUsOS4wMTUxMDY3MiBMNi41NjI1LDExLjgxMjUgTDkuMDgwMTUzOTUsMTEuODEyNSBMOC40NDM1NDEwMiwxMS4xMDUxNTIzIEM4LjMxNDExMzcyLDEwLjk2MTM0NDIgOC4yOTQ1MTIwOCwxMC43NDk2MDE3IDguMzk1MzQwNjUsMTAuNTg0NDc4MSBDOS41NzkyMzcyNSw4LjY0NTY1MDAyIDExLjY4NTY3NjUsNy40Mzc1IDE0LDcuNDM3NSBDMTcuNjI0MzY4Nyw3LjQzNzUgMjAuNTYyNSwxMC4zNzU2MzEzIDIwLjU2MjUsMTQgQzIwLjU2MjUsMTcuNjI0MzY4NyAxNy42MjQzNjg3LDIwLjU2MjUgMTQsMjAuNTYyNSBDMTEuMzYwMTM5NCwyMC41NjI1IDkuMDE1NDMzOTIsMTguOTg5MjY4OSA3Ljk4MzYwOTI0LDE2LjYyNSBMNy4wMzg2NTYxMiwxNi42MjUgQzguMTE0MzU4OTMsMTkuNDgxMDU4NSAxMC44NjUzNDcsMjEuNDM3NSAxNCwyMS40Mzc1IFoiIGlkPSJTaGFwZSIgZmlsbD0iIzE1NEU4NCIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+IC0tPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
export { rotateIcon };