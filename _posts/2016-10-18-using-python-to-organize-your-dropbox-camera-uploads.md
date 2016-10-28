---
layout: post
title: Using python to organize your dropbox camera uploads
---

Test

{% highlight python %}

import os
import datetime

camera_uploads = os.path.dirname(os.path.realpath(__file__))

def main():
  photos = os.listdir(camera_uploads)

  extensions = ['mts', 'mov', 'jpg', 'gif', 'mp4', 'png']

  for photo in photos:

    # skip non-photo files
    if photo.startswith(".") or photo == "Icon" or photo == __file__.split("/")[-1]:
      continue

    # skip weird extensions
    if not any([photo.endswith(extension) for extension in extensions]):
      continue

    # skip pre-existing directories
    if os.path.isdir(photo):
      continue

    try:
      move_and_make_dir_if_necessary(photo)
    except Exception as e:
      print("couldn't move {}".format(photo))
      print(e)


def joinpath(path1, path2):
  return "{}/{}".format(path1, path2)


def get_date_directory_for_photo(photo_path):
  date_string = photo_path.split(" ")[0]
  date = datetime.datetime.strptime(date_string, "%Y-%m-%d")
  directory = joinpath(camera_uploads, date.strftime("%Y/%m/%d"))
  return directory


def move_and_make_dir_if_necessary(photo_path):
  should_move_to = get_date_directory_for_photo(photo_path)
  os.makedirs(should_move_to, exist_ok=True)
  os.rename(joinpath(camera_uploads, photo_path), joinpath(should_move_to, photo_path))


if __name__ == "__main__":
  main()

{% endhighlight %}
