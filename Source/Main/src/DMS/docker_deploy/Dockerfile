FROM mcr.microsoft.com/dotnet/aspnet:2.1 AS base
WORKDIR /app
EXPOSE 80

COPY  . .
ENTRYPOINT ["dotnet", "DMS.dll"]