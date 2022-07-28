using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Http;
using DMS.Business;
using DMS.Service;
using DMS.Utils;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SimpleTokenProvider;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection.Extensions;
using AutoMapper;
using DMS.Models;
using Swashbuckle.AspNetCore.Swagger;
using DMS.Constants;
using DMS.Business.CloudDriveBusiness;
using DMS.Extensions;
using Hangfire;
using DMS.Cache;
using XenaSignalR;
using DMS.Utils.Firebase;
using DMS.Utils.Caches;

namespace DMS
{
    public class Startup
    {
        public IConfiguration Configuration { get; set; }
        readonly private string OAuthSecretKey;
        readonly private SymmetricSecurityKey OAuthSigningKey;
        private IHostingEnvironment CurrentEnvironment { get; set; }

        public Startup(IHostingEnvironment env)
        {
            //https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-2.1

            CurrentEnvironment = env;

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsEnvironment("Development"))
            {
                // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
                builder.AddApplicationInsightsSettings(developerMode: true);
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();

            // get OAuthSecretKey from "appsetting.json" file
            OAuthSecretKey = Configuration[ConstAuth.AppSettings_OAuthSecretKey];
            // set value for OAuthSigningKey
            OAuthSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(OAuthSecretKey));
        }

        // This method gets called by the runtime. Use this method to add services to the container
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddApplicationInsightsTelemetry(Configuration);

            // REF: https://docs.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-2.1
            // Enable Crossdomain
            services.AddCors();

            if (CurrentEnvironment.IsDevelopment())
            {
                // Register the Swagger generator, defining 1 or more Swagger documents
                services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new Info { Title = "DMS API", Version = "v1" });
                    c.AddSecurityDefinition("Bearer", new ApiKeyScheme { In = "header", Description = "Please enter JWT with Bearer into field", Name = "Authorization", Type = "apiKey" });
                    c.AddSecurityRequirement(new Dictionary<string, IEnumerable<string>> { { "Bearer", System.Linq.Enumerable.Empty<string>() }, });
                });
            }

            #region AutoMapper
            // Auto Mapper Configurations
            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new AutoMapperProfile());
            });
            IMapper mapper = mappingConfig.CreateMapper();
            services.TryAddSingleton(mapper);

            //services.AddAutoMapper(x => x.AddProfile(new AutoMapperProfile()));
            #endregion

            services.AddMvc(config =>
            {
                config.Filters.Add(typeof(CustomExceptionFilter));

                // Make authentication compulsory across the board (i.e. shut
                // down EVERYTHING unless explicitly opened up).
                var policy = new AuthorizationPolicyBuilder()
                                 .RequireAuthenticatedUser()
                                 .Build();
                config.Filters.Add(new AuthorizeFilter(policy));

            });

            services.AddMyHangFire(Configuration.GetSection("AppSettings:HangFire:Config").Value);

            //Configure Jwt
            ConfigureJwt(services);

            services.AddResponseCompression();

            services.AddMemoryCache();

            #region Injection Class
            services.AddScoped<ResultActionFilter>();
            services.TryAddSingleton<IImageResizer, ImageResizer>();
            services.TryAddSingleton<IPathProvider, PathProvider>();
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.TryAddSingleton<ISignalRClientHelper, SignalRClientHelper>();
            services.TryAddSingleton<IUserLoginCache, UserLoginCache>();
            services.TryAddSingleton<IFirebaseNotificationClient, FirebaseNotificationClient>();
            services.TryAddSingleton<MyMemoryCache>();

            #region appsettings.json
            // Register the IConfiguration instance which AppSettings binds against.
            services.Configure<AppSettings>(Configuration.GetSection("AppSettings"));
            services.Configure<SentrySettings>(Configuration.GetSection("Sentry"));
            services.Configure<FirebaseSettings>(Configuration.GetSection("Firebase"));

            services.TryAddSingleton(Configuration);
            services.TryAddSingleton<IAppServerSetting, AppServerSetting>(); 
            #endregion

            services.AddTransient<IBaseBusiness, BaseBusiness>();
            services.AddTransient<IDynamicDataService, DynamicDataService>();
            services.AddTransient<IAuthenticateBusiness, AuthenticateBusiness>();

            services.AddTransient<IUniqueBusiness, UniqueBusiness>();
            services.AddTransient<IUniqueService, UniqueService>();

            services.AddTransient<IParkedItemService, ParkedItemService>();
            services.AddTransient<IParkedItemBusiness, ParkedItemBusiness>();

            services.AddTransient<IGlobalService, GlobalService>();
            services.AddTransient<IGlobalBusiness, GlobalBusiness>();

            services.AddTransient<IPersonService, PersonService>();
            services.AddTransient<IPersonBusiness, PersonBusiness>();

            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IUserBusiness, UserBusiness>();

            services.AddTransient<IElasticSearchSyncBusiness, ElasticSearchSyncBusiness>();
            services.AddTransient<IElasticSearchSyncService, ElasticSearchSyncService>();

            services.AddTransient<ICommonBusiness, CommonBusiness>();
            services.AddTransient<ICommonService, CommonService>();

            services.AddTransient<INotificationBusiness, NotificationBusiness>();
            services.AddTransient<INotificationService, NotificationService>();

            services.AddTransient<IEmailBusiness, EmailBusiness>();

            services.AddTransient<IDocumentBusiness, DocumentBusiness>();
            services.AddTransient<IDocumentCommonBusiness, DocumentCommonBusiness>();
            services.AddTransient<IDocumentIndexingBusiness, DocumentIndexingBusiness>();
            services.AddTransient<IDocumentEmailBusiness, DocumentEmailBusiness>();
            services.AddTransient<IDocumentPermissionBusiness, DocumentPermissionBusiness>();
            services.AddTransient<IDocumentService, DocumentService>();

            services.AddTransient<IFileBusiness, FileBusiness>();

            services.AddTransient<IArticleBusiness, ArticleBusiness>();
            services.AddTransient<IArticleService, ArticleService>();

            services.AddTransient<ICampaignService, CampaignService>();
            services.AddTransient<ICampaignBusiness, CampaignBusiness>();

            services.AddTransient<IToolsService, ToolsService>();
            services.AddTransient<IToolsBusiness, ToolsBusiness>();

            services.AddTransient<IBackOfficeService, BackOfficeService>();
            services.AddTransient<IBackOfficeBusiness, BackOfficeBusiness>();

            services.AddTransient<IPrintingBusiness, PrintingBusiness>();
            services.AddTransient<IPrintingService, PrintingService>();

            services.AddTransient<IInventoryBusiness, InventoryBusiness>();
            services.AddTransient<IPurchaseReportBusiness, PurchaseReportBusiness>();

            services.AddTransient<IDocumentContainerBusiness, DocumentContainerBusiness>();
            services.AddTransient<IDocumentContainerService, DocumentContainerService>();

            services.AddTransient<IFileServerBusiness, FileServerBusiness>();

            services.AddTransient<IOrderDataEntryService, OrderDataEntryService>();
            services.AddTransient<IOrderDataEntryBusiness, OrderDataEntryBusiness>();

            services.AddTransient<IDocumentSystemBusiness, DocumentSystemBusiness>();
            services.AddTransient<IDocumentSystemService, DocumentSystemService>();

            services.AddTransient<IOCRDocumentBusiness, OCRDocumentBusiness>();
            services.AddTransient<IConvertImageBusiness, ConvertImageBusiness>();
            services.AddTransient<IConvertImageProcessBusiness, ConvertImageProcessBusiness>();

            services.AddTransient<IInvoiceBusiness, InvoiceBusiness>();
            services.AddTransient<IInvoiceService, InvoiceService>();

            services.AddTransient<IContactBusiness, ContactBusiness>();
            services.AddTransient<IContactService, ContactService>();

            services.AddTransient<IContractBusiness, ContractBusiness>();
            services.AddTransient<IContractService, ContractService>();

            services.AddTransient<IOtherDocumentBusiness, OtherDocumentBusiness>();
            services.AddTransient<IOtherDocumentService, OtherDocumentService>();

            services.AddTransient<IDynamicFieldService, DynamicFieldService>();
            services.AddTransient<IDynamicFieldsBusiness, DynamicFieldsBusiness>();

            services.AddTransient<ICloudBusiness, CloudBusiness>();
            services.AddTransient<ICloudService, CloudService>();
            services.AddTransient<ICloudJobBusiness, CloudJobBusiness>();

            services.AddTransient<IHistorytBusiness, HistorytBusiness>();
            services.AddTransient<IHistoryService, HistoryService>();

            services.AddTransient<IScanningReportBusiness, ScanningReportBusiness>();
            services.AddTransient<IScanningReportService, ScanningReportService>();

            services.AddTransient<IInvoiceApprovalBusiness, InvoiceApprovalBusiness>();
            services.AddTransient<IInvoiceApprovalService, InvoiceApprovalService>();

            services.AddTransient<IHeadquarterBusiness, HeadquarterBusiness>();
            services.AddTransient<IHeadquarterService, HeadquarterService>();

            services.AddTransient<IPriceTagBusiness, PriceTagBusiness>();
            #endregion
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddDebug();

            if (Configuration["AppSettings:EnableLog4Net"] == "True")
            {
                if (Directory.Exists(env.ContentRootPath) && File.Exists(Path.Combine(env.ContentRootPath, "log4net.config")))
                {
                    loggerFactory.AddLog4Net();
                }
            }

#pragma warning disable CS0612 // Type or member is obsolete
            app.UseApplicationInsightsRequestTelemetry();
#pragma warning restore CS0612 // Type or member is obsolete

#pragma warning disable CS0612 // Type or member is obsolete
            app.UseApplicationInsightsExceptionTelemetry();
#pragma warning restore CS0612 // Type or member is obsolete            

            // REF: https://docs.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-2.1
            // global cors policy
            app.UseCors(builder => builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());

            app.UseMyHangFire();

            app.UseAuthentication();

            //TODO: turn off temporarily
            //app.UseMiddleware<ProcessingMiddleware>();

            #region Swagger
            if (env.IsDevelopment())
            {
                // Enable middleware to serve generated Swagger as a JSON endpoint.
                app.UseSwagger();

                // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.), 
                // specifying the Swagger JSON endpoint.
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("../swagger/v1/swagger.json", "DMS API V1");
                });
            }
            #endregion

            app.Use(async (context, next) =>
            {
                await next();
                if (context.Response.StatusCode == 404 &&
                !Path.HasExtension(context.Request.Path.Value))
                {
                    context.Request.Path = "/index.html";
                    await next();
                }
            })
            .UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "index.html" } })
            .UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), @"wwwroot")),
                RequestPath = new PathString("")
            })
            .UseStaticFiles(new StaticFileOptions    //For the '.well-known' folder
            {
                  FileProvider = new PhysicalFileProvider(System.IO.Path.Combine(Directory.GetCurrentDirectory(), ".well-known")),
                  RequestPath = "/.well-known",
                  OnPrepareResponse = (responseContext) =>
                  {
                      if ("apple-app-site-association".Equals(responseContext.File.Name))
                      {
                          responseContext.Context.Response.ContentType = "application/json";
                      }
                  },
                  ServeUnknownFileTypes = true,
            })
            .UseDirectoryBrowser(new DirectoryBrowserOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
                RequestPath = ""
            })
            .UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

        #region Jwt
        /// <summary>
        /// Configure Jwt
        /// </summary>
        /// <param name="services"></param>
        private void ConfigureJwt(IServiceCollection services)
        {
            //http://jasonwatmore.com/post/2018/08/14/aspnet-core-21-jwt-authentication-tutorial-with-example-api
            //http://jasonwatmore.com/post/2018/06/26/aspnet-core-21-simple-api-for-authentication-registration-and-user-management

            #region JwtIssuerOptions
            // Get options from "appsetting.json" file
            var jwtAppSettingOptions = Configuration.GetSection(nameof(JwtIssuerOptions));

            // Configure JwtIssuerOptions
            services.Configure<JwtIssuerOptions>(options =>
            {
                options.Issuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)];
                options.Audience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)];
                options.SigningCredentials = new SigningCredentials(OAuthSigningKey, SecurityAlgorithms.HmacSha256);
            });
            #endregion

            #region Authentication
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)],

                ValidateAudience = true,
                ValidAudience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)],

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = OAuthSigningKey,

                RequireExpirationTime = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(configureOptions =>
            {
                configureOptions.ClaimsIssuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)];
                configureOptions.TokenValidationParameters = tokenValidationParameters;
                configureOptions.SaveToken = true;
            });
            #endregion

            #region Authorization
            // api user claim policy
            services.AddAuthorization(options =>
            {
                options.AddPolicy(ConstAuth.UserRoleKey,
                                  policy => policy.RequireClaim(ConstAuth.RoleKey, ConstAuth.RoleAdminKey));
            });
            #endregion
        }
        #endregion
    }
}
