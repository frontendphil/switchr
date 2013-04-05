from subprocess import Popen

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from switchr.settings import SYSTEM_PASSWORD


def index(request):
    return render_to_response("base.html", {}, context_instance=RequestContext(request))


@csrf_exempt
def switch(request):
    system = request.POST.get("system")
    channel = request.POST.get("channel")
    active = request.POST.get("active")

    cmd = "echo %s | sudo -S send %s %s %s" % (SYSTEM_PASSWORD, system, channel, active)
    Popen(cmd, shell=True)

    return HttpResponse(status=200)
