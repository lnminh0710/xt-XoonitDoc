#step
1/ npm run client_aot
2/ publish DMS
3/ copy published files to server
4/ copy appsetting: update value "Platform", copy log4net
5/ command cd to current path
6/ run command: docker build -t xoonit-ui-tamtv .
7/ docker run -d -it -p 8026:80 -v /tmp/tamtv/xoonit_ui/assest:/app/upload  --name xoonit-ui-tamtv xoonit-ui-tamtv
	- /tmp/tamtv/xoonit_ui/assest: shared folder in server
	- /app/upload: shared folder in docker container