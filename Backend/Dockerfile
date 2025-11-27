FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj from Backend folder to current workdir (/src)
COPY Backend/Backend.csproj .
RUN dotnet restore "./Backend.csproj"

# Copy entire Backend folder source
COPY Backend/ .
RUN dotnet publish "./Backend.csproj" -c Release -o /app/out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Backend.dll"]