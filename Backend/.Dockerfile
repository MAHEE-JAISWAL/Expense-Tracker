FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore to leverage layer cache
COPY ["Backend.csproj", "./"]
RUN dotnet restore "./Backend.csproj"

# copy everything and publish
COPY . .
RUN dotnet publish "./Backend.csproj" -c Release -o /app/out

# runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080

# ensure Kestrel listens on 8080
ENV ASPNETCORE_URLS=http://+:8080

# runtime entry (published DLL name = Backend.dll)
ENTRYPOINT ["dotnet", "Backend.dll"]