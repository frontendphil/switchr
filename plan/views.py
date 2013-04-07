import json

from subprocess import Popen

from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse

from switchr.settings import SYSTEM_PASSWORD
from plan.models import System, Channel


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


@require_POST
def add(request):
    code = request.POST.get("code", None)
    channels = request.POST.getlist("channels[]")
    name = request.POST.get("name")

    if code:
        try:
            system = System.objects.get(code=code)

            return HttpResponse("System already exists",
                                status=500)
        except:
            system = System.objects.create(code=code, name=name)

            position = 1

            for channel in channels:
                Channel.objects.create(system=system, name=channel, position=position)

                position = position + 1

    return HttpResponse(json.dumps(system.json()), status=200, mimetype="application/json")


def systems(request):
    systems = [system.json() for system in System.objects.all()]

    return HttpResponse(json.dumps(systems), status=200, mimetype="application/json")


@require_POST
def remove(request):
    code = request.POST.get("code", None)
    system = get_object_or_404(System, code=code)

    system.delete()

    return HttpResponse(status=200)
