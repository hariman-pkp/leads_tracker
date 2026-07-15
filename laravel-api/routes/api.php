<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PipelineController;
use App\Http\Controllers\Api\TodayController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\FollowupController;
use App\Http\Controllers\Api\WinlossController;
use App\Http\Controllers\Api\ContactsController;
use App\Http\Controllers\Api\InsightsController;
use App\Http\Controllers\Api\RevenueController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\KpiController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\DailyReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\FieldActivityController;
use App\Http\Controllers\Api\ForecastController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\SalesTargetController;
use App\Http\Controllers\Api\EntertainController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AnnualTargetController;
use App\Http\Controllers\Api\ShareLinkController;
use App\Http\Controllers\Api\VisitPlanController;

// ── PUBLIC SHARE LINKS (no auth) ──────────────────────────────────────────
Route::get ('/v1/public/annual-target/{token}',          [ShareLinkController::class, 'checkToken']);
Route::post('/v1/public/annual-target/{token}/verify',   [ShareLinkController::class, 'verifyAnnualTarget']);
Route::get ('/v1/public/revenue-dashboard/{token}',      [ShareLinkController::class, 'checkTokenDashboard']);
Route::post('/v1/public/revenue-dashboard/{token}/verify',[ShareLinkController::class, 'verifyDashboard']);

// ── AUTH ──────────────────────────────────────────────────────────────────
Route::post('/v1/auth/login',            [AuthController::class, 'login']);
Route::post('/v1/auth/logout',          [AuthController::class, 'logout'])->middleware('jwt');
Route::get ('/v1/auth/me',              [AuthController::class, 'me'])->middleware('jwt');
Route::put ('/v1/auth/change-password', [AuthController::class, 'changePassword'])->middleware('jwt');

// ── PROFILE ───────────────────────────────────────────────────────────────
Route::middleware('jwt')->group(function () {
    Route::get   ('/v1/profile',                 [ProfileController::class, 'show']);
    Route::patch ('/v1/profile/avatar-color',    [ProfileController::class, 'updateAvatarColor']);
    Route::post  ('/v1/profile/avatar-photo',    [ProfileController::class, 'uploadAvatarPhoto']);
    Route::delete('/v1/profile/avatar-photo',    [ProfileController::class, 'deleteAvatarPhoto']);
});

// ── Static file proxy (public, dengan CORS) ───────────────────────────────
Route::get('/v1/static/{path}', [EntertainController::class, 'serveFile'])
     ->where('path', '.+');

// ── PROTECTED ROUTES ──────────────────────────────────────────────────────
Route::middleware('jwt')->group(function () {

    // Dashboard
    Route::get('/v1/dashboard', [DashboardController::class, 'index'])
         ->middleware('jwt:dashboard');

    // Pipeline Forecast — harus sebelum /pipeline/{leadId}
    Route::get('/v1/pipeline/forecast', [ForecastController::class, 'index'])
         ->middleware('jwt:pipeline');

    // Pipeline
    Route::get   ('/v1/pipeline',          [PipelineController::class, 'index'])
         ->middleware('jwt:pipeline');
    Route::post  ('/v1/pipeline',          [PipelineController::class, 'store'])
         ->middleware('jwt:pipeline');
    Route::get   ('/v1/pipeline/{leadId}', [PipelineController::class, 'show'])
         ->middleware('jwt:pipeline');
    Route::put   ('/v1/pipeline/{leadId}', [PipelineController::class, 'update'])
         ->middleware('jwt:pipeline');
    Route::delete('/v1/pipeline/{leadId}', [PipelineController::class, 'destroy'])
         ->middleware('jwt:pipeline');

    // Today & Schedule
    Route::get('/v1/today',    [TodayController::class, 'index'])
         ->middleware('jwt:pipeline');
    Route::get('/v1/schedule', [ScheduleController::class, 'index'])
         ->middleware('jwt:pipeline');
    Route::get  ('/v1/plan/weekly', [PlanController::class, 'weekly'])
         ->middleware('jwt:plan');
    Route::patch('/v1/plan/assign', [PlanController::class, 'assign'])
         ->middleware('jwt:plan');

    // Follow-up
    Route::get  ('/v1/followup',          [FollowupController::class, 'index'])
         ->middleware('jwt:pipeline');
    Route::post ('/v1/followup',          [FollowupController::class, 'store'])
         ->middleware('jwt:pipeline');
    Route::get  ('/v1/followup/{leadId}', [FollowupController::class, 'show'])
         ->middleware('jwt:pipeline');

    // Win/Loss
    Route::get ('/v1/winloss',                    [WinlossController::class, 'index'])
         ->middleware('jwt:pipeline');
    Route::post('/v1/winloss/reason',             [WinlossController::class, 'storeReason'])
         ->middleware('jwt:pipeline');
    Route::get ('/v1/winloss/reason/{leadId}',    [WinlossController::class, 'getReason'])
         ->middleware('jwt:pipeline');

    // Contacts
    Route::get   ('/v1/contacts',              [ContactsController::class, 'index'])
         ->middleware('jwt:pipeline');
    Route::post  ('/v1/contacts',              [ContactsController::class, 'store'])
         ->middleware('jwt:pipeline');
    Route::put   ('/v1/contacts/{id}',         [ContactsController::class, 'update'])
         ->middleware('jwt:pipeline');
    Route::delete('/v1/contacts/{id}',         [ContactsController::class, 'destroy'])
         ->middleware('jwt:pipeline');
    Route::post  ('/v1/contacts/{id}/restore', [ContactsController::class, 'restore'])
         ->middleware('jwt:pipeline');

    // Insights
    Route::get('/v1/insights', [InsightsController::class, 'index'])
         ->middleware('jwt:insights');

    // Revenue
    Route::get('/v1/revenue/summary',  [RevenueController::class, 'summary'])
         ->middleware('jwt:rev_dashboard');
    Route::get('/v1/revenue/insights', [RevenueController::class, 'insights'])
         ->middleware('jwt:rev_insights');
    Route::get('/v1/revenue/projects', [RevenueController::class, 'projects'])
         ->middleware('jwt:rev_tracker');
    Route::get('/v1/revenue/monthly',         [RevenueController::class, 'monthly'])
         ->middleware('jwt:rev_monthly');
    Route::get('/v1/revenue/project-monthly', [RevenueController::class, 'projectMonthlyView'])
         ->middleware('jwt:rev_proj_view');
    Route::get('/v1/revenue/invoices',         [RevenueController::class, 'invoices'])
         ->middleware('jwt:rev_invoice');
    Route::post('/v1/revenue/invoices',        [RevenueController::class, 'storeInvoice'])
         ->middleware('jwt:rev_invoice');
    Route::post('/v1/revenue/invoices/{id}/pay', [RevenueController::class, 'payInvoice'])
         ->middleware('jwt:rev_invoice');
    Route::put   ('/v1/revenue/invoices/{id}',      [RevenueController::class, 'updateInvoice'])
         ->middleware('jwt:rev_invoice');
    Route::delete('/v1/revenue/invoices/{id}',      [RevenueController::class, 'deleteInvoice'])
         ->middleware('jwt:rev_invoice');
    Route::post('/v1/revenue/projects',           [RevenueController::class, 'storeProject'])
         ->middleware('jwt:rev_tracker');
    Route::put   ('/v1/revenue/projects/{id}',    [RevenueController::class, 'updateProject'])
         ->middleware('jwt:rev_tracker');
    Route::delete('/v1/revenue/projects/{id}',        [RevenueController::class, 'deleteProject'])
         ->middleware('jwt:rev_tracker');
    Route::patch ('/v1/revenue/projects/{id}/status', [RevenueController::class, 'patchProjectStatus'])
         ->middleware('jwt:rev_tracker');
    Route::post  ('/v1/revenue/projects/{id}/restore', [RevenueController::class, 'restoreProject'])
         ->middleware('jwt:rev_tracker');
    Route::get   ('/v1/revenue/trashed',              [RevenueController::class, 'trashedProjects'])
         ->middleware('jwt:rev_tracker');
    Route::get ('/v1/revenue/projects/{id}/monthly', [RevenueController::class, 'projectMonthly'])
         ->middleware('jwt:rev_tracker');
    Route::put ('/v1/revenue/monthly/{id}',       [RevenueController::class, 'updateMonthly'])
         ->middleware('jwt:rev_tracker');
    Route::post('/v1/revenue/monthly/upsert',     [RevenueController::class, 'upsertMonthly'])
         ->middleware('jwt:rev_tracker');
    Route::get   ('/v1/revenue/won-leads',            [RevenueController::class, 'wonLeads'])
         ->middleware('jwt:rev_tracker');
    Route::delete('/v1/revenue/won-leads/{lead_id}',  [RevenueController::class, 'excludeWonLead'])
         ->middleware('jwt:rev_tracker');
    Route::post  ('/v1/revenue/import-won',           [RevenueController::class, 'importWon'])
         ->middleware('jwt:rev_tracker');
    Route::get('/v1/revenue/kpi',              [RevenueController::class, 'kpi'])
         ->middleware('jwt:rev_kpi');
    Route::get('/v1/revenue/budget',   [RevenueController::class, 'budget'])
         ->middleware('jwt:rev_budget');

    // Master
    Route::get('/v1/master/roles',          [MasterController::class, 'roles'])
         ->middleware('jwt:roles');
    Route::put('/v1/master/roles/{id}',     [MasterController::class, 'updateRole'])
         ->middleware('jwt:roles');
    Route::get('/v1/master/users',          [MasterController::class, 'users'])
         ->middleware('jwt:users');
    Route::put('/v1/master/users/{id}',     [MasterController::class, 'updateUser'])
         ->middleware('jwt:users');
    Route::get('/v1/master/sales',          [MasterController::class, 'sales'])
         ->middleware('jwt:sales');
    Route::get('/v1/master/menus',                    [MasterController::class, 'menus'])
         ->middleware('jwt:roles');
    Route::put('/v1/master/menus/{id}',              [MasterController::class, 'updateMenu'])
         ->middleware('jwt:roles');
    Route::get('/v1/master/roles/{id}/menus',        [MasterController::class, 'roleMenus'])
         ->middleware('jwt:roles');
    Route::put('/v1/master/roles/{id}/menus',        [MasterController::class, 'updateRoleMenus'])
         ->middleware('jwt:roles');
    Route::post  ('/v1/master/users',                [MasterController::class, 'createUser'])
         ->middleware('jwt:users');
    Route::delete('/v1/master/users/{id}',           [MasterController::class, 'deleteUser'])
         ->middleware('jwt:users');

    // Menus for current user (used by Nuxt sidebar)
    Route::get('/v1/menus', [MasterController::class, 'userMenus']);

    // ── Master Organisasi ────────────────────────────────────────────────────
    // ── Field Activity ───────────────────────────────────────────────────
    Route::get ('/v1/field-activity/stats',           [FieldActivityController::class, 'stats'])   ->middleware('jwt:field_activity');
    Route::get ('/v1/field-activity/monitor',         [FieldActivityController::class, 'monitor']) ->middleware('jwt:field_activity');
    Route::get ('/v1/field-activity/map',             [FieldActivityController::class, 'map'])     ->middleware('jwt:field_activity');
    Route::get ('/v1/field-activity/users',           [FieldActivityController::class, 'users'])   ->middleware('jwt:field_activity');
    Route::get ('/v1/field-activity',                 [FieldActivityController::class, 'index'])   ->middleware('jwt:field_activity');
    Route::post('/v1/field-activity/checkin',         [FieldActivityController::class, 'checkin']) ->middleware('jwt:field_activity');
    Route::put ('/v1/field-activity/{id}/checkout',   [FieldActivityController::class, 'checkout'])->middleware('jwt:field_activity');
    Route::delete('/v1/field-activity/{id}',          [FieldActivityController::class, 'destroy']) ->middleware('jwt:field_activity');

    // ── Visit Plans ──────────────────────────────────────────────────────
    Route::get   ('/v1/visit-plan',      [VisitPlanController::class, 'index'])  ->middleware('jwt:field_activity');
    Route::post  ('/v1/visit-plan',      [VisitPlanController::class, 'store'])  ->middleware('jwt:field_activity');
    Route::put   ('/v1/visit-plan/{id}', [VisitPlanController::class, 'update']) ->middleware('jwt:field_activity');
    Route::delete('/v1/visit-plan/{id}', [VisitPlanController::class, 'destroy'])->middleware('jwt:field_activity');

    // ── Master Produk ────────────────────────────────────────────────────
    Route::get   ('/v1/master/products/dropdown', [ProductController::class, 'dropdown'])->middleware('jwt:products');
    Route::get   ('/v1/master/products',          [ProductController::class, 'index'])   ->middleware('jwt:products');
    Route::post  ('/v1/master/products',          [ProductController::class, 'store'])   ->middleware('jwt:products');
    Route::put   ('/v1/master/products/{id}',     [ProductController::class, 'update'])  ->middleware('jwt:products');
    Route::delete('/v1/master/products/{id}',     [ProductController::class, 'destroy']) ->middleware('jwt:products');

    Route::get   ('/v1/master/organizations/dropdown', [OrganizationController::class, 'dropdown'])->middleware('jwt:org');
    Route::get   ('/v1/master/organizations',          [OrganizationController::class, 'index'])   ->middleware('jwt:org');
    Route::post  ('/v1/master/organizations',          [OrganizationController::class, 'store'])   ->middleware('jwt:org');
    Route::put   ('/v1/master/organizations/{id}',     [OrganizationController::class, 'update'])  ->middleware('jwt:org');
    Route::delete('/v1/master/organizations/{id}',     [OrganizationController::class, 'destroy']) ->middleware('jwt:org');

    // ── KPI Prospecting ──────────────────────────────────────────────────────
    Route::get   ('/v1/kpi/prospecting/years',  [KpiController::class, 'years'])  ->middleware('jwt:rev_kpi');
    Route::get   ('/v1/kpi/prospecting',        [KpiController::class, 'index'])  ->middleware('jwt:rev_kpi');
    Route::post  ('/v1/kpi/prospecting',        [KpiController::class, 'store'])  ->middleware('jwt:rev_kpi');
    Route::put   ('/v1/kpi/prospecting/{id}',   [KpiController::class, 'update']) ->middleware('jwt:rev_kpi');
    Route::delete('/v1/kpi/prospecting/{id}',   [KpiController::class, 'destroy'])->middleware('jwt:rev_kpi');

    // ── Budget Monitoring ────────────────────────────────────────────────────
    Route::get   ('/v1/budget/years',   [BudgetController::class, 'years'])  ->middleware('jwt:rev_budget');
    Route::get   ('/v1/budget',         [BudgetController::class, 'index'])  ->middleware('jwt:rev_budget');
    Route::post  ('/v1/budget',         [BudgetController::class, 'store'])  ->middleware('jwt:rev_budget');
    Route::put   ('/v1/budget/{id}',    [BudgetController::class, 'update']) ->middleware('jwt:rev_budget');
    Route::delete('/v1/budget/{id}',    [BudgetController::class, 'destroy'])->middleware('jwt:rev_budget');

    // ── Import / Upload ──────────────────────────────────────────────────────
    Route::get ('/v1/import/template/pipeline', [ImportController::class, 'templatePipeline'])->middleware('jwt:import');
    Route::get ('/v1/import/template/revenue',  [ImportController::class, 'templateRevenue']) ->middleware('jwt:import');
    Route::get ('/v1/import/template/invoice',  [ImportController::class, 'templateInvoice']) ->middleware('jwt:import');
    Route::post('/v1/import/pipeline',          [ImportController::class, 'importPipeline'])  ->middleware('jwt:import');
    Route::post('/v1/import/revenue',           [ImportController::class, 'importRevenue'])   ->middleware('jwt:import');
    Route::post('/v1/import/invoice',           [ImportController::class, 'importInvoice'])   ->middleware('jwt:import');

    // ── Location Tracking ────────────────────────────────────────────────────
    Route::get ('/v1/location/settings',     [LocationController::class, 'settings']);
    Route::post('/v1/location',              [LocationController::class, 'store']);
    Route::get ('/v1/location/me',           [LocationController::class, 'me']);
    Route::get ('/v1/location/team',         [LocationController::class, 'team']);
    Route::get ('/v1/location/team/trails',  [LocationController::class, 'teamTrails']);

    // ── Daily Report ─────────────────────────────────────────────────────────
    // Rute spesifik harus didaftarkan SEBELUM rute dengan {id} parameter
    Route::get ('/v1/daily-report/summary',    [DailyReportController::class, 'summary']);
    Route::get ('/v1/daily-report/team',       [DailyReportController::class, 'team']);
    Route::get ('/v1/daily-report',            [DailyReportController::class, 'index']);
    Route::post('/v1/daily-report',            [DailyReportController::class, 'store']);
    Route::get ('/v1/daily-report/{id}',       [DailyReportController::class, 'show']);
    Route::put ('/v1/daily-report/{id}',       [DailyReportController::class, 'update']);
    Route::post('/v1/daily-report/{id}/send',  [DailyReportController::class, 'send']);

    // ── Notifications ─────────────────────────────────────────────────────────
    // Rute spesifik harus didaftarkan SEBELUM rute dengan {id} parameter
    Route::get ('/v1/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/v1/notifications/push',         [NotificationController::class, 'push']);
    Route::post('/v1/notifications/read-all',     [NotificationController::class, 'markAllRead']);
    Route::get ('/v1/notifications',              [NotificationController::class, 'index']);
    Route::post('/v1/notifications/{id}/read',    [NotificationController::class, 'markRead']);

    // ── Analytics Personal ─────────────────────────────────────────────
    Route::get ('/v1/analytics/personal',  [\App\Http\Controllers\Api\AnalyticsController::class, 'personal']);

    // ── Sales Target ─────────────────────────────────────────────────────────
    Route::get ('/v1/sales-targets', [SalesTargetController::class, 'index']);
    Route::post('/v1/sales-targets', [SalesTargetController::class, 'upsert']);

    // ── Entertainment Claim ───────────────────────────────────────────────────
    Route::get  ('/v1/entertain/claims',              [EntertainController::class, 'index']);
    Route::post ('/v1/entertain/claims',              [EntertainController::class, 'store']);
    Route::get  ('/v1/entertain/claims/{cid}',        [EntertainController::class, 'show']);
    Route::post ('/v1/entertain/claims/{cid}/photo',  [EntertainController::class, 'uploadPhoto']);
    Route::patch('/v1/entertain/claims/{cid}/cancel',  [EntertainController::class, 'cancel']);
    Route::post ('/v1/entertain/claims/{cid}/approve', [EntertainController::class, 'approve']);

    // Share Links (protected)
    Route::get ('/v1/share-links/annual-target',             [ShareLinkController::class, 'getAnnualTarget'])        ->middleware('jwt:rev_annual_target');
    Route::post('/v1/share-links/annual-target/generate',    [ShareLinkController::class, 'generateAnnualTarget'])   ->middleware('jwt:rev_annual_target');
    Route::get ('/v1/share-links/revenue-dashboard',         [ShareLinkController::class, 'getDashboard'])           ->middleware('jwt:revenue');
    Route::post('/v1/share-links/revenue-dashboard/generate',[ShareLinkController::class, 'generateDashboard'])      ->middleware('jwt:revenue');

    // Export Data
    Route::get('/v1/export/pipeline',            [ExportController::class, 'pipelineCsv'])        ->middleware('jwt:pipeline');
    Route::get('/v1/export/pipeline/pdf',        [ExportController::class, 'pipelinePdf'])        ->middleware('jwt:pipeline');
    Route::get('/v1/export/daily-reports',       [ExportController::class, 'dailyReportCsv'])     ->middleware('jwt:daily_report');
    Route::get('/v1/export/daily-reports/pdf',   [ExportController::class, 'dailyReportPdf'])     ->middleware('jwt:daily_report');
    Route::get('/v1/export/analytics',           [ExportController::class, 'analyticsCsv'])       ->middleware('jwt:pipeline');
    Route::get('/v1/export/analytics/pdf',       [ExportController::class, 'analyticsPdf'])       ->middleware('jwt:pipeline');

    // Annual Target
    Route::get ('/v1/annual-targets/orgs',    [AnnualTargetController::class, 'orgs'])       ->middleware('jwt:rev_annual_target');
    Route::post('/v1/annual-targets/orgs',    [AnnualTargetController::class, 'saveOrgs'])   ->middleware('jwt:rev_annual_target');
    Route::get ('/v1/annual-targets/summary', [AnnualTargetController::class, 'summary'])    ->middleware('jwt:rev_annual_target');
    Route::get ('/v1/annual-targets',         [AnnualTargetController::class, 'index'])      ->middleware('jwt:rev_annual_target');
    Route::post('/v1/annual-targets',         [AnnualTargetController::class, 'save'])       ->middleware('jwt:rev_annual_target');

});
