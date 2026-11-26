using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.RateLimiting;
using TechOdyssey.Application.Abstractions;
using TechOdyssey.Api.Security;
using TechOdyssey.Api.Models;
using TechOdyssey.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.Configure<AdminResetOptions>(
    builder.Configuration.GetSection(AdminResetOptions.SectionName));
builder.Services.AddOptions<PublicHomeOptions>()
    .Bind(builder.Configuration.GetSection(PublicHomeOptions.SectionName))
    .Validate(
        options => options.IsValid(),
        "PublicHome configuration is incomplete or invalid.")
    .ValidateOnStart();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "TechOdyssey.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromDays(14);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
        options.Events.OnValidatePrincipal = async context =>
        {
            var userIdValue = context.Principal?.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var passwordVersionValue = context.Principal?.FindFirst("password_version")?.Value;
            if (!Guid.TryParse(userIdValue, out var userId)
                || !int.TryParse(passwordVersionValue, out var passwordVersion))
            {
                context.RejectPrincipal();
                await context.HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme);
                return;
            }

            var store = context.HttpContext.RequestServices.GetRequiredService<IGamificationStore>();
            var account = await store.FindAccountByIdAsync(
                userId,
                context.HttpContext.RequestAborted);
            if (account is null || account.PasswordVersion != passwordVersion)
            {
                context.RejectPrincipal();
                await context.HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme);
            }
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("authentication", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

var dataDirectory = builder.Configuration["Gamification:DataDirectory"] ?? "App_Data";
var resolvedDataDirectory = Path.IsPathRooted(dataDirectory)
    ? dataDirectory
    : Path.Combine(builder.Environment.ContentRootPath, dataDirectory);
builder.Services.AddSingleton<IGamificationStore>(
    new JsonGamificationStore(resolvedDataDirectory));

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];
if (builder.Environment.IsDevelopment())
{
    allowedOrigins = allowedOrigins
        .Append("http://localhost:5173")
        .Append("http://127.0.0.1:5173")
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
