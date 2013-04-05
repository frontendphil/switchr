from django.conf.urls import patterns, include

urlpatterns = patterns('',
    (r'^plan/', include("plan.urls")),
)
