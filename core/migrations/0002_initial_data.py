from django.db import migrations


def create_initial_data(apps, schema_editor):
    Skill = apps.get_model('core', 'Skill')
    JobRole = apps.get_model('core', 'JobRole')

    # Create some common skills
    skill_names = [
        'Python', 'Django', 'REST', 'SQL', 'Git',
        'JavaScript', 'React', 'HTML', 'CSS'
    ]
    skills = {}
    for name in skill_names:
        obj, _ = Skill.objects.get_or_create(name=name)
        skills[name] = obj

    # Backend Developer role (id will be 1 if DB empty)
    backend, _ = JobRole.objects.get_or_create(title='Backend Developer')
    backend.required_skills.add(
        skills['Python'], skills['Django'], skills['REST'], skills['SQL'], skills['Git']
    )

    # Frontend Developer role (id will be 2 if DB empty)
    frontend, _ = JobRole.objects.get_or_create(title='Frontend Developer')
    frontend.required_skills.add(
        skills['JavaScript'], skills['React'], skills['HTML'], skills['CSS'], skills['Git']
    )


def remove_initial_data(apps, schema_editor):
    Skill = apps.get_model('core', 'Skill')
    JobRole = apps.get_model('core', 'JobRole')

    JobRole.objects.filter(title__in=['Backend Developer', 'Frontend Developer']).delete()
    Skill.objects.filter(name__in=[
        'Python', 'Django', 'REST', 'SQL', 'Git',
        'JavaScript', 'React', 'HTML', 'CSS'
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_data, reverse_code=remove_initial_data),
    ]
