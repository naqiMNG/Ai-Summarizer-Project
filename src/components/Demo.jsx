import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../assets";
import trash from "../assets/trash.svg";
import { useLazyGetSummaryQuery } from "../services/article";
import SummaryBox from "./SummaryBox";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });

  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");

  // RTK lazy query
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  // Load data from localStorage on mount
  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingArticle = allArticles.find(
      (item) => item.url === article.url
    );

    if (existingArticle) return setArticle(existingArticle);

    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      // update state and local storage
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  // copy the url and toggle the icon for user feedback
  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  // remove artical result
  useEffect(() => {
    const storedArray = JSON.parse(localStorage.getItem("articles")) || [];
    setAllArticles(storedArray);
  }, []);

  const handleRemoveStorage = (index) => {
    const updatedArray = [...allArticles];
    localStorage.removeItem("articles");
    updatedArray.splice(index, 1);
    setAllArticles(updatedArray);
    localStorage.setItem("articles", JSON.stringify(updatedArray));
    if (allArticles?.length === 0) {
      setArticle();
    }
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2 summarize_section_inner">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link-icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />

          <input
            type="url"
            placeholder="Paste the article link"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            onKeyDown={handleKeyDown}
            required
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-500 peer-focus:text-gray-500 "
          >
            <p>↵</p>
          </button>
        </form>

        {/* Browse History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.reverse().map((item, index) => (
            <div className="resutl_link_card">
              <button
                className="trash_icon"
                onClick={() => handleRemoveStorage(index)}
              >
                <img
                  src={trash}
                  alt="trash_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </button>
              <div
                key={`link-${index}`}
                onClick={() => setArticle(item)}
                className="link_card"
              >
                <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                  <img
                    src={copied === item.url ? tick : copy}
                    alt={copied === item.url ? "tick_icon" : "copy_icon"}
                    className="w-[40%] h-[40%] object-contain"
                  />
                </div>
                <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                  {item.url}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Display Result */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          <>
            {allArticles?.length == 0 ? (
              <></>
            ) : (
              <>
                {article.summary && (
                  <div className="flex flex-col gap-3">
                    <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                      Article <span className="blue_gradient">Summary</span>
                    </h2>
                    <SummaryBox articlesummary={article.summary} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Demo;
