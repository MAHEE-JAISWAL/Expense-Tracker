FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore
COPY Backend/Backend.csproj Backend/
RUN dotnet restore Backend/Backend.csproj

# copy entire repo and publish
COPY . .
WORKDIR /src/Backend
RUN dotnet publish -c Release -o /app/out

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Backend.dll"]
