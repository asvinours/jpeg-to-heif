# JPEG to HEIF file

### This is just a POC repository

My only goal was to prove that I could create heif images from jpeg files
Few things to know about this repository:
 - the original jpeg images have not been optimized. A jpegoptim Q90 version is also available for most images
 - jpeg images need to have even width and even height (don 't ask me why)
 - to display the images I used the nokia JS implementation

Most of the JS and HTML code is coming from https://compare.rokka.io/_compare/
I am not entirely sure if it was okay to copy it but I was unable to find any license terms on their web page.

Instructions to build the heif images have been copied from:
 - http://jpgtoheif.com/
 - https://gpac.wp.imt.fr/2017/06/09/gpac-support-for-heif/

TODO:
 - create heif image collections

If you want to test it by yourself, I have added a Dockerfile to build gpac and all the required tools
```bash
# this will build the gpac docker image
$ docker-compose build
# this will start the nginx web-server
$ docker-compose up
```

To convert images:
```bash
$ for F in *.jpg *.jpeg; \
  do ffmpeg -i ./$F -crf 20 -preset slower -pix_fmt yuv420p -f hevc $F.hvc && \
     MP4Box -add-image $F.hvc -ab heic -new $F.heic && \
     rm $F.hvc;
  done;
```
