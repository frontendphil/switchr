from django.db import models


class System(models.Model):

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=5)

    def channels(self):
        return self.channel_set.all()

    def json(self):
        return {
            "name": self.name,
            "code": self.code,
            "channels": [channel.json() for channel in self.channel_set.all()]
        }


class Channel(models.Model):

    active = models.BooleanField(default=False)
    name = models.CharField(max_length=255)

    system = models.ForeignKey(System)

    def json(self):
        return {
            "name": self.name,
            "on": self.active
        }
