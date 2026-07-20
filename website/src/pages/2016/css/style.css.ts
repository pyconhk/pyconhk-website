import cyberportBack from '@/years/2016/assets/live/2016/remote/2015/images/cyberport-back.jpg';

export const prerender = true;

const styleCss = `@import url('https://fonts.googleapis.com/css?family=Roboto');

body, :root {
    font-size: 18px;
    font-family: 'Roboto', sans-serif;
}

.blue-zone {
    color: #222;
    background-color: #0bb0f0 !important;
}

.blue-zone a {
    color: #d04057;
}

.red-zone {
    background-color: #d04057 !important;
}

.red-zone a {
    color: #ddd;
}

footer {
    border-top: 1px gray solid;
    margin-top: 20px;
}

table td {
    text-align: center;
}

.logo {
    max-width: 200px;
}

.sponsor h2 {
    font-size: 1.25em;
    margin-top: 10px;
    margin-bottom: 10px;
    font-weight: 500;
}

.venue, .patron {
    font-size: 18px;
}

.image_margin {
    margin: 10px 10px;
}

.pycon_background {
    background-image: url("${cyberportBack.src}");
    background-size: cover;
    background-position: bottom;
    background-attachment: fixed;
}

.topic {
    text-align: justify;
}

.cyberport_logo_dim, .ms_logo_dim  {
    width: 200px;
    height: 97px;
}

.ms_logo_dim  {
    width: 132px;
    height: 46px;
}

.psf_logo_dim {
    width: 132px;
    height: 43px;
}

.gandi_logo_dim {
    width: 132px;
    height: 41px;
}

.jb_logo_dim {
    width: 132px;
    height: 76px;
}

.fca_logo_dim {
    width: 132px;
    height: 60px;
}

.mysql_logo_dim {
    width: 132px;
    height: 73px;
}

.ibm_logo_dim {
    width: 132px;
    height: 49px;
}

.cota_logo_dim {
    width: 60px;
    height: 44px;
}

.hkoscon_logo_dim {
    width: 160px;
    height: 36px;
}

.ga_logo_dim {
  width: 100px;
  height: 100px;
}

.time {
    font-weight: bold;
}

.organizer_content {
    padding-top: 20px;
    padding-bottom: 20px;
}

.bottom_social_media {
    font-size: 26px !Important;
    padding: 5px 5px 5px 0px;
    text-decoration: none !Important;
}

.heidi_pic_width {
    max-width: 350px;
}

.progress {
    height: 30px;
    margin-bottom: 20px;
    overflow: hidden;
    background-color: #f5f5f5;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .1);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, .1);
}
.progress-bar {
    float: left;
    width: 0;
    height: 100%;
    font-size: 16px;
    line-height: 20px;
    color: #fff;
    text-align: center;
    background-color: #337ab7;
    -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
    -webkit-transition: width .6s ease;
    -o-transition: width .6s ease;
    transition: width .6s ease;
    font-weight: bold;
}
.progress-striped .progress-bar,
.progress-bar-striped {
    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    -webkit-background-size: 40px 40px;
    background-size: 40px 40px;
}
.progress.active .progress-bar,
.progress-bar.active {
    -webkit-animation: progress-bar-stripes 2s linear infinite;
    -o-animation: progress-bar-stripes 2s linear infinite;
    animation: progress-bar-stripes 2s linear infinite;
}
.progress-bar-success {
    background-color: #5cb85c;
}
.progress-striped .progress-bar-success {
    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
.progress-bar-info {
    background-color: #5bc0de;
}
.progress-striped .progress-bar-info {
    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
.progress-bar-warning {
    background-color: #f0ad4e;
}
.progress-striped .progress-bar-warning {
    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
.progress-bar-danger {
    background-color: #d9534f;
}
.progress-striped .progress-bar-danger {
    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
    background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
`;

export function GET() {
  return new Response(styleCss, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
    },
  });
}
