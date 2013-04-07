from django.conf.urls import patterns, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('plan.views',
    url(r'^$', 'index'),
    url(r'^switch/$', 'switch'),
    url(r'^add/$', 'add', name='add_system'),
    url(r'^systems/$', 'systems'),
    url(r'^remove/$', 'remove'),
)
